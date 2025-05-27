export default {
    open() {
        console.log('Attempting to open IndexedDB...');
        let req = indexedDB.open('FocusPulse', 7); // 增加版本号以触发数据库升级
        req.onupgradeneeded = function (event) {
            console.log('Database upgrade needed');
            let db = event.target.result;
            if (!db.objectStoreNames.contains("todo_lists")) {
                console.log('Creating todo_lists store');
                // 使用listId作为主键
                db.createObjectStore('todo_lists', { keyPath: 'listId', autoIncrement: false});
            }

            if (!db.objectStoreNames.contains("repeating_events")) {
                console.log('Creating repeating_events store');
                db.createObjectStore('repeating_events', { autoIncrement: false});
            }

            if (!db.objectStoreNames.contains("repeating_events_by_date")) {
                console.log('Creating repeating_events_by_date store');
                db.createObjectStore('repeating_events_by_date', { autoIncrement: false});
            }
        }
        req.onerror = function (event) { // 打开数据库失败
            console.error('Error opening database:', event.target.error);
        }
        req.onsuccess = function(event) {
            console.log('Database opened successfully');
        }
        return req; // 返回IDBOpenDBRequest对象，令外部可以监听事件
    },
    get(db, table, id) { //db: 数据库对象, table: 表名, date: 日期
        let tx = db.transaction([table], 'readonly'); // 参数一：要访问的表名数组，参数二：事务模式，返回 IDBTransaction 对象
        let store = tx.objectStore(table); // 返回指定名称的 IDBObjectStore（对象存储）
        let req = store.get(id); // get(key) 发起一个请求来获取对应主键的数据
        return req; // 返回值：IDBRequest 对象
    },
    add(db, table, obj) {
        let tx = db.transaction([table], 'readwrite');
        let store = tx.objectStore(table);
        let req = store.add(obj); // 只传对象，不传 key
        console.log(obj)
        return req;
    },
    update(db, table, obj) {
        let tx = db.transaction([table], 'readwrite');
        let store = tx.objectStore(table);
        let new_obj = JSON.parse(JSON.stringify(obj));
        console.log(new_obj)
        let req = store.put(new_obj); // 只传对象，不传 key
        return req;
    },
    delete(db, table, id) {
        let tx = db.transaction([table], 'readwrite');
        let store = tx.objectStore(table);
        let req = store.delete(id);
        return req;
    },
    selectAll(db, table){
        let tx = db.transaction([table], 'readwrite');
        let store = tx.objectStore(table);
        let req = store.openCursor(); // 游标遍历表中的所有记录
        return req;
    },
    clear(db, table){
        let tx = db.transaction([table], 'readwrite');
        let store = tx.objectStore(table);
        let req = store.clear();
        return req;
    }
};