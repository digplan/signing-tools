class Simplesign {
    publicKey
    privateKey
    async createKeys() {
        return new Promise(async (r) => {
            const keys = await window.crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-384" }, true, ["sign", "verify"])
            this.publicKey = keys.publicKey
            this.privateKey = keys.privateKey
            r({
                public: await this.exportPublic(),
                private: await this.exportPrivate()
            })
        })
    }
    buf2hex(buffer) {
        return [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, '0')).join('')
    }
    hex2buf(hex) {
        return new Uint8Array(hex.match(/../g).map(h => parseInt(h, 16))).buffer
    }
    async sign(s) {
        const sigbuf = await crypto.subtle.sign({ name: 'ECDSA', hash: { name: 'SHA-384' } }, this.privateKey, new TextEncoder().encode(s))
        return this.buf2hex(sigbuf)
    } 
    async verify(s, sigobj) {
        return await crypto.subtle.verify({ name: 'ECDSA', hash: { name: 'SHA-384' } }, this.publicKey, this.hex2buf(sigobj), new TextEncoder().encode(s))
    }
    async exportPublic() {
        return await crypto.subtle.exportKey('jwk', this.publicKey)
    }
    async exportPrivate() {
        return await crypto.subtle.exportKey('jwk', this.privateKey)
    }
    async importPrivate(jwk) {
        if(typeof jwk === 'string') jwk = JSON.parse(jwk)
        this.publicKey = ''
        return this.privateKey = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-384' }, true, ['sign'])
    }
    async hash(s) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
    }
}