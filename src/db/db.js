import Dexie from 'dexie';

/**
 * Database class that represents a single instance of IndexedDB database.
 * Any database schema modifications (e.g. table addition/update/deletion or schema update) will increment database version by one.
 */
export class IndexedDb {
    /**
     * Create a new empty database with version 1.
     * @param {string} dbName database name to be created. Defaults to __'localDb'__.
     */
    constructor(dbName = 'localDb') {
        this.version = 1;
        this.db = new Dexie(dbName);

        this.db.version(this.version).stores({});
    }

    /**
     * **PRIVATE METHOD**
     *
     * **INTERNAL USE ONLY**
     *
     * Creates/modifies/deletes table specified by __tableName__ based on the __schema__.
     * If __schema__ is equal to __null__, the table is deleted.
     *
     * **NOTE** primary key changing is not supported and will yield and error.
     * @param {*} param config Object that is used in DB update.
     * @returns Table object or null.
     */
    async _modifyDB({ schema = '', tableName }) {
        this.version++;
        this.db.close();
        const sch = {};
        sch[tableName] = schema;
        console.log(sch);
        this.db.version(this.version).stores(sch);

        await this.db.open();
        return this._getTableIfExists(tableName);
    }

    /**
     * **PRIVATE METHOD**
     *
     * **INTERNAL USE ONLY**
     *
     * Attempts to retrieve table specified by __tableName__.
     * @param {*} tableName table name to be retrieved
     * @returns Table object or null
     */
    _getTableIfExists(tableName) {
        let table = null;
        try {
            table = this.db.table(tableName);
        } catch (err) {
            // table does not exist, catch error and return null.
            if (!(err instanceof Dexie.InvalidTableError)) {
                throw err;
            }
        }
        return table;
    }

    /**
     * **PRIVATE METHOD**
     *
     * **INTERNAL USE ONLY**
     *
     * If tableName is an existant table, data is added/replaced based on the existance of the primary key.
     * If table with a given name does not exist, table is going to be created based on schema.
     * If no schema is provided, all of the subsequent operations on that table will not be indexed.
     *
     * @param {*} param config Object for data inserion/update
     * @returns promise that resolves to id of the newly created/updated entry.
     */
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
                table = await this._modifyDB({
                    tableName: tableName,
                    schema: schema ? schema : '_id++',
                });
            } catch (err) {
                console.error(err);
                throw `Unable to create table ${tableName}. ${err.message}`;
            }
        }
        return table;
    }

    async openDB() {
        if (!this.db.isOpen()) {
            await this.db.open();
        }
    }

    /**
     * Opens database.
     *
     * **NOTE** for dev purposes it will also clear the database before opening.
     * @returns promise that will resolve when database is open.
     */
    async init() {
        // FOR DEV ONLY. delete previous versions of the db
        await this.db.delete();

        await this.openDB();
    }

    /**
     * Adds or updates __data__ into a table specified by __tableName__.
     * If __schema__ is present, current table schema is attempted to be updated according to __schema__.
     *
     * **NOTE** chaning of the table primary key is not currently supported and will yield and error.
     * @param {*} param config Object for data addition into a table
     * @returns promise that resolves to the id of the newly inserted/updated record.
     */
    async putData({ tableName, data, schema = '', primaryKey = '' }) {
        await this.openDB();
        const t = await this._populateData({
            tableName: tableName,
            schema: schema,
        });
        console.log('Data = ' + data);
        return await t.put(data);
    }

    /**
     * Adds __data__ into a table specified by __tableName__.
     * If __schema__ is present, current table schema is attempted to be updated according to __schema__.
     *
     * **NOTE** chaning of the table primary key is not currently supported and will yield and error.
     * @param {*} param config Object for data addition into a table
     * @returns promise that resolves to the id of the newly inserted record.
     */
    async addData({ tableName, data, schema = '' }) {
        await this.openDB();
        const t = await this._populateData({
            tableName: tableName,
            schema: schema,
        });
        console.log('Data = ' + data);
        return await t.add(data);
    }

    /**
     * Fetches row(s) from the table specified by __tableName__.
     * If __propertyName__ and __value__ are present, column(__propertyName__) is searched for entry(__value__).
     * If only __tableName__ is present, the entire table is returned as an array of objects.
     *
     * **NOTE** __conditions__ are not currently supported.
     * @param {*} param config Object with parameters to modify info retrieval.
     * @returns either an array of objects represinting the entire table, or a single object representing a specific row.
     */
    async getData({
        tableName = '',
        propertyName = '',
        value = '',
        conditions = '',
    } = {}) {
        await this.openDB();
        const query = {};
        // check to see if it is a number, since dexie is doing a strict comparison.
        const num = parseFloat(value);
        query[propertyName] = isNaN(num) ? value : num;
        console.log(JSON.stringify(query) + ' ' + tableName);
        if (!propertyName) {
            return await this.db.table(tableName).toArray();
        } else {
            return await this.db
                .table(tableName)
                .where(query)
                .toArray();
        }
    }

    /**
     *  Deletes table/row from the table specified by __tableName__.
     *  If __propertyName__ is not provided, the entire table is going to be deleted.
     *  If __propertyName__ and __value__ are specified, row which primary key is equals to the __value__ is going to be deleted.
     *
     * **NOTE** __conditions__ are not supported at the moment.
     * @param {*} param config Object that contains parameters for deletion
     * @returns promise that resolves with number of entries deleted if operation is successful.
     */
    async deleteData({
        tableName,
        propertyName = '',
        value = '',
        conditions = '',
    }) {
        await this.openDB();
        const query = {};
        // check to see if it is a number, since dexie is doing a strict comparison.
        const num = parseFloat(value);
        query[propertyName] = isNaN(num) ? value : num;
        console.log(JSON.stringify(query) + ' ' + tableName);
        if (!propertyName) {
            await this._modifyDB({ tableName: tableName, schema: null });
            // a single table was deleted
            return 1;
        } else {
            return await this.db
                .table(tableName)
                .where(query)
                .delete();
        }
    }
}
