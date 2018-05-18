import Dexie from 'dexie';

export class IndexedDb {
    constructor(dbName = 'localDb') {
        this.version = 1;
        this.db = new Dexie(dbName);

        this.db.version(this.version).stores({});
    }

    async init() {
        // FOR DEV ONLY. delete previous versions of the db
        await this.db.delete();

        await this.db.open();
    }

    async _addData({ tableName = '', data = {} } = {}) {
        let table = this.db.table(tableName);
        return await table.add(data);
    }

    async _createTable({ schema = '', tableName = '' } = {}) {
        this.version++;
        this.db.close();
        const sch = {};
        sch[tableName] = schema ? schema : '_id++';
        console.log(sch);
        await this.db.version(this.version).stores(sch);

        await this.db.open();
        return await this.db.table(tableName);
    }

    _getTableIfExists(tableName) {
        let table = null;
        try {
            table = this.db.table(tableName);
        } catch (err) {
            // table does not exist, catch it error and return null.
        }
        return table;
    }

    // if tableName is an existant table, data is added/replaced based on the existance of the primary key.
    // if table with a given name does not exist, table is going to be created based on schema.
    // If no schema is provided, all of the subsequent operations on that table will not be indexed.
    // returns id of the newally created entry.
    // CAN THROW.
    async _populateData({ tableName, schema = '' }) {
        let table = this._getTableIfExists(tableName);
        // table not found, need to create it before proceeding
        if (!table || schema) {
            // since we need to create a new table, the schema has to be specified.
            // if not provided, your entry will not be indexed.
            if (!schema) {
                console.warn(
                    `${tableName} table does not exist and appropriate schema was not provided. All entries will not be indexed, until table schema is updated.`
                );
            }
            try {
                table = await this._createTable({
                    tableName: tableName,
                    schema: schema,
                });
            } catch (err) {
                console.error(err);
                throw `Unable to create table ${tableName}`;
            }
        }
        return table;
    }

    async putData({ tableName, data, schema = '', primaryKey = '' }) {
        const t = await this._populateData({
            tableName: tableName,
            schema: schema,
        });
        console.log('Data = ' + data);
        return await this.db.transaction('rw', t, async () => {
            return primaryKey
                ? await t.put(data, primaryKey)
                : await t.put(data);
        });
    }

    async addData({ tableName, data, schema = '' }) {
        const t = await this._populateData({
            tableName: tableName,
            schema: schema,
        });
        console.log('Data = ' + data);
        return await this.db.transaction('rw', t, async () => {
            return await t.add(data);
        });
    }

    async getData({
        tableName = '',
        propertyName = '',
        value = '',
        conditions = '',
    } = {}) {
        const query = {};
        query[propertyName] = value;
        return await this.db[tableName].where(query).first();
    }
}
