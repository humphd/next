import Dexie from 'dexie';

export class IndexedDb {
    constructor(dbName = 'localDb') {
        this.version = 1;
        this.db = new Dexie(dbName);
        this.db.version(this.version).stores({});
        this.db.open();
    }

    async addData({ tableName = '', data = {} } = {}) {
        let table = this.db.table(tableName);
        return await table.add(data);
    }

    async createTable({ schema = '', tableName = '' } = {}) {
        this.version++;
        this.db.close();
        const sch = {};
        sch[tableName] = schema;
        await this.db.version(this.version).stores(sch);
        return await this.db.open();
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
