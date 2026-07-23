import { db, auth } from './firebase';
import { collection, query as fsQuery, onSnapshot, where, orderBy, limit as fsLimit, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, getCountFromServer } from 'firebase/firestore';

export class ApiMockBuilder {
  tableName: string;
  action: 'select' | 'insert' | 'update' | 'delete' = 'select';
  payload: any = null;
  filters: any = {};
  options: any = {};
  isSingle: boolean = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns: string = '*', options?: any) {
    if (this.action !== 'insert' && this.action !== 'update' && this.action !== 'delete') {
      this.action = 'select';
    }
    this.options.columns = columns;
    if (options) {
      this.options = { ...this.options, ...options };
    }
    return this;
  }

  insert(data: any) {
    this.action = 'insert';
    this.payload = data;
    return this;
  }

  update(data: any) {
    this.action = 'update';
    this.payload = data;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(column: string, value: any) {
    this.filters.eq = this.filters.eq || [];
    this.filters.eq.push([column, value]);
    return this;
  }

  neq(column: string, value: any) {
    this.filters.neq = this.filters.neq || [];
    this.filters.neq.push([column, value]);
    return this;
  }

  order(column: string, options: { ascending?: boolean } = { ascending: true }) {
    this.options.order = { column, ascending: options.ascending };
    return this;
  }

  limit(count: number) {
    this.options.limit = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async executeWithRetry(operation: () => Promise<any>, maxRetries = 3): Promise<any> {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        return await operation();
      } catch (error: any) {
        if (error.code === 'unavailable' || error.message?.includes('network')) {
          retries++;
          if (retries >= maxRetries) throw error;
          const delay = Math.pow(2, retries) * 1000 + Math.random() * 1000;
          console.warn(`Firestore connection failed. Retrying in ${Math.round(delay)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  }

  async execute() {
    try {
      const result = await this.executeWithRetry(async () => {
        const colRef = collection(db, this.tableName);
        let innerResult: any = null;
        if (this.action === 'select') {
          if (this.options?.head && this.options?.count === 'exact') {
            const snapshot = await getCountFromServer(colRef);
            return { data: null, error: null, count: snapshot.data().count };
          } else {
            let q: any = colRef;
            
            if (this.filters.eq) {
              for (const [col, val] of this.filters.eq) {
                q = fsQuery(q, where(col === 'id' ? '__name__' : col, '==', val));
              }
            }
            if (this.filters.neq) {
              for (const [col, val] of this.filters.neq) {
                q = fsQuery(q, where(col === 'id' ? '__name__' : col, '!=', val));
              }
            }
            if (this.options.order) {
              const { column, ascending } = this.options.order;
              q = fsQuery(q, orderBy(column === 'id' ? '__name__' : column, ascending ? 'asc' : 'desc'));
            }
            if (this.options.limit) {
              q = fsQuery(q, fsLimit(this.options.limit));
            }
            
            const snapshot = await getDocs(q);
            const rows = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
            innerResult = this.isSingle ? (rows[0] || null) : rows;
          }
        } else if (this.action === 'insert') {
          const toInsert = Array.isArray(this.payload) ? this.payload : [this.payload];
          const rows = [];
          for (const item of toInsert) {
            const docRef = doc(colRef);
            const data = { ...item, created_at: new Date().toISOString() };
            await setDoc(docRef, data);
            rows.push({ id: docRef.id, ...data });
          }
          innerResult = this.isSingle ? rows[0] : rows;
        } else if (this.action === 'update' || this.action === 'delete') {
          let docsToModify: any[] = [];
          if (this.filters.eq && this.filters.eq.some(([col]: any) => col === 'id')) {
             const idVal = this.filters.eq.find(([col]: any) => col === 'id')[1];
             const d = await getDoc(doc(colRef, idVal));
             if (d.exists()) docsToModify = [d];
          } else {
             let q: any = colRef;
             if (this.filters.eq) {
               for (const [col, val] of this.filters.eq) {
                 q = fsQuery(q, where(col === 'id' ? '__name__' : col, '==', val));
               }
             }
             const snapshot = await getDocs(q);
             docsToModify = snapshot.docs;
          }
          const rows = [];
          for (const d of docsToModify) {
            if (this.action === 'update') {
              await updateDoc(d.ref, this.payload);
              const updated = await getDoc(d.ref);
              rows.push({ id: updated.id, ...(updated.data() as any) });
            } else {
              const data = { id: d.id, ...(d.data() as any) };
              await deleteDoc(d.ref);
              rows.push(data);
            }
          }
          innerResult = this.isSingle ? rows[0] : rows;
        }
        return innerResult;
      });
      return { data: result, error: null };
    } catch (error) {
      console.error('Firebase Client SDK Error:', error);
      return { data: null, error };
    }
  }


  subscribe(callback: (payload: { data: any[] | null, error: any }) => void) {
    if (this.action !== 'select') {
      throw new Error('subscribe() can only be used with select()');
    }
    
    let colRef = collection(db, this.tableName);
    let q: any = colRef;
    
    if (this.filters.eq) {
      for (const [col, val] of this.filters.eq) {
        q = fsQuery(q, where(col === 'id' ? '__name__' : col, '==', val));
      }
    }
    if (this.options.order) {
      const { column, ascending } = this.options.order;
      q = fsQuery(q, orderBy(column === 'id' ? '__name__' : column, ascending ? 'asc' : 'desc'));
    }
    if (this.options.limit) {
      q = fsQuery(q, fsLimit(this.options.limit));
    }
    
    return onSnapshot(q, (snapshot: any) => {
      let data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      
      if (this.isSingle) {
        if (data.length === 0) {
          callback({ data: null, error: { message: 'Row not found', code: 'PGRST116' } });
        } else {
          callback({ data: data[0], error: null });
        }
      } else {
        callback({ data, error: null });
      }
    }, (error: any) => {
      callback({ data: null, error });
    });
  }

  // To allow `await apiClient.from(...).select()`

  then(resolve: (value: any) => void, reject?: (reason: any) => void) {
    this.execute().then(resolve, reject);
  }
}

export const apiClient = {
  from: (tableName: string) => {
    return new ApiMockBuilder(tableName);
  },
  auth: {
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signOut: async () => ({ error: null }),
  },
  functions: {
    invoke: async (functionName: string, options: any) => {
      const response = await fetch(`/api/functions/${functionName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options.body)
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Function failed');
      return { data: json, error: null };
    }
  },
  removeChannel: () => {},
  channel: () => ({
    on: () => ({ subscribe: () => ({}) })
  })
};

export const hasApiConfig = true;

export const getErrorMessage = (error: any, defaultMessage: string) => {
  return error?.message || defaultMessage;
};
