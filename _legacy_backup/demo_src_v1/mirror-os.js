// ================================================================
// ACTIVE MIRROROS — Core Kernel (IndexedDB Storage)
// ================================================================

const DB_NAME = 'ActiveMirrorOS';
const DB_VERSION = 2;

export class MirrorOS {
    constructor() {
        this.db = null;
        this.identity = null;
    }

    async init() {
        await this.openDB();
        this.identity = await this.getIdentity();
        return this.identity;
    }

    // ===== DATABASE =====
    openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Store: identity
                if (!db.objectStoreNames.contains('identity')) {
                    db.createObjectStore('identity', { keyPath: 'id' });
                }

                // Store: sessions
                if (!db.objectStoreNames.contains('sessions')) {
                    const store = db.createObjectStore('sessions', { keyPath: 'id' });
                    store.createIndex('started', 'started', { unique: false });
                }

                // Store: vault
                if (!db.objectStoreNames.contains('vault')) {
                    const store = db.createObjectStore('vault', { keyPath: 'id' });
                    store.createIndex('type', 'type', { unique: false });
                    store.createIndex('created', 'created', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => reject(event.target.error);
        });
    }

    // ===== IDENTITY =====
    async getIdentity() {
        return new Promise((resolve) => {
            const tx = this.db.transaction('identity', 'readonly');
            const store = tx.objectStore('identity');
            const request = store.get('mirror_seed');
            request.onsuccess = () => resolve(request.result || null);
        });
    }

    async createIdentity(preferences = {}) {
        const seed = {
            id: 'mirror_seed',
            created: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            preferences: {
                model: preferences.model || 'llama-3b',
                redTeamDefault: false,
                theme: 'dark',
                ...preferences
            },
            stats: {
                totalSessions: 0,
                totalMessages: 0,
                firstVisit: new Date().toISOString(),
                lastVisit: new Date().toISOString()
            },
            patterns: []
        };

        const tx = this.db.transaction('identity', 'readwrite');
        tx.objectStore('identity').put(seed);
        this.identity = seed;
        return seed;
    }

    async updateIdentity(updates) {
        let identity = await this.getIdentity();

        if (!identity) {
            identity = await this.createIdentity();
        }

        const updated = {
            ...identity,
            ...updates,
            lastSeen: new Date().toISOString(),
            preferences: {
                ...identity.preferences,
                ...(updates.preferences || {})
            },
            stats: {
                ...identity.stats,
                ...(updates.stats || {})
            }
        };

        const tx = this.db.transaction('identity', 'readwrite');
        tx.objectStore('identity').put(updated);
        this.identity = updated;
        return updated;
    }

    // ===== SESSIONS =====
    async saveSession(session) {
        const tx = this.db.transaction('sessions', 'readwrite');
        tx.objectStore('sessions').put(session);

        // Update stats
        const identity = await this.getIdentity();
        if (identity) {
            await this.updateIdentity({
                stats: {
                    ...identity.stats,
                    totalSessions: (identity.stats?.totalSessions || 0) + 1,
                    totalMessages: (identity.stats?.totalMessages || 0) + session.messages.length
                }
            });
        }
    }

    async getSession(id) {
        return new Promise((resolve) => {
            const tx = this.db.transaction('sessions', 'readonly');
            const request = tx.objectStore('sessions').get(id);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async getRecentSessions(limit = 20) {
        return new Promise((resolve) => {
            const tx = this.db.transaction('sessions', 'readonly');
            const request = tx.objectStore('sessions').getAll();
            request.onsuccess = () => {
                const res = request.result.sort((a, b) =>
                    new Date(b.started) - new Date(a.started)
                );
                resolve(res.slice(0, limit));
            };
        });
    }

    async deleteSession(id) {
        const tx = this.db.transaction('sessions', 'readwrite');
        tx.objectStore('sessions').delete(id);
    }

    // ===== VAULT =====
    async createVaultItem(type, data) {
        const item = {
            id: crypto.randomUUID(),
            type,
            title: data.title || 'Untitled',
            content: data.content || '',
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            tags: data.tags || [],
            linkedSessions: data.linkedSessions || [],
            starred: false,
            archived: false
        };

        const tx = this.db.transaction('vault', 'readwrite');
        tx.objectStore('vault').put(item);
        return item;
    }

    async getVaultItem(id) {
        return new Promise((resolve) => {
            const tx = this.db.transaction('vault', 'readonly');
            const request = tx.objectStore('vault').get(id);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async getVaultItems(filters = {}) {
        return new Promise((resolve) => {
            const tx = this.db.transaction('vault', 'readonly');
            const request = tx.objectStore('vault').getAll();
            request.onsuccess = () => {
                let items = request.result;

                // Apply filters
                if (filters.type) {
                    items = items.filter(i => i.type === filters.type);
                }
                if (filters.starred) {
                    items = items.filter(i => i.starred);
                }
                if (!filters.includeArchived) {
                    items = items.filter(i => !i.archived);
                }
                if (filters.tag) {
                    items = items.filter(i => i.tags?.includes(filters.tag));
                }

                // Sort by modified date (newest first)
                items.sort((a, b) => new Date(b.modified) - new Date(a.modified));

                resolve(items);
            };
        });
    }

    async updateVaultItem(id, updates) {
        const item = await this.getVaultItem(id);
        if (!item) return null;

        const updated = {
            ...item,
            ...updates,
            modified: new Date().toISOString()
        };

        const tx = this.db.transaction('vault', 'readwrite');
        tx.objectStore('vault').put(updated);
        return updated;
    }

    async deleteVaultItem(id) {
        const tx = this.db.transaction('vault', 'readwrite');
        tx.objectStore('vault').delete(id);
    }

    async toggleStar(id) {
        const item = await this.getVaultItem(id);
        if (!item) return null;
        return this.updateVaultItem(id, { starred: !item.starred });
    }

    async archiveItem(id) {
        return this.updateVaultItem(id, { archived: true });
    }

    // ===== SEARCH =====
    async searchVault(query) {
        const [sessions, vaultItems] = await Promise.all([
            this.getRecentSessions(100),
            this.getVaultItems({ includeArchived: false })
        ]);

        const q = query.toLowerCase();

        const matchingSessions = sessions.filter(s =>
            s.title?.toLowerCase().includes(q) ||
            s.messages?.some(m => m.content?.toLowerCase().includes(q))
        ).map(s => ({ ...s, itemType: 'session' }));

        const matchingVault = vaultItems.filter(item =>
            item.title?.toLowerCase().includes(q) ||
            item.content?.toLowerCase().includes(q) ||
            item.tags?.some(t => t.toLowerCase().includes(q))
        ).map(v => ({ ...v, itemType: v.type }));

        return [...matchingSessions, ...matchingVault].slice(0, 20);
    }

    // ===== EXPORT =====
    async exportAll() {
        const identity = await this.getIdentity();
        const sessions = await this.getRecentSessions(1000);
        const vaultItems = await this.getVaultItems({ includeArchived: true });

        return {
            exported: new Date().toISOString(),
            version: '1.0',
            app: 'Active MirrorOS',
            identity,
            sessions,
            vault: vaultItems
        };
    }

    // ===== CLEAR ALL =====
    async clearAll() {
        return new Promise((resolve) => {
            const tx = this.db.transaction(['identity', 'sessions', 'vault'], 'readwrite');
            tx.objectStore('identity').clear();
            tx.objectStore('sessions').clear();
            tx.objectStore('vault').clear();
            tx.oncomplete = () => {
                this.identity = null;
                resolve();
            };
        });
    }
}
