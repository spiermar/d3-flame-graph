function generateHash (name) {
    // Return a vector (0.0->1.0) that is a hash of the input string.
    // The hash is computed to favor early characters over later ones, so
    // that strings with similar starts have similar vectors. Only the first
    // 6 characters are considered.
    const MAX_CHAR = 6

    let hash = 0
    let maxHash = 0
    let weight = 1
    const mod = 10

    if (name) {
        for (let i = 0; i < name.length; i++) {
            if (i > MAX_CHAR) { break }
            hash += weight * (name.charCodeAt(i) % mod)
            maxHash += weight * (mod - 1)
            weight *= 0.70
        }
        if (maxHash > 0) { hash = hash / maxHash }
    }
    return hash
}

export function generateColorVector (name) {
    let vector = 0
    if (name) {
        const nameArr = name.split('`')
        if (nameArr.length > 1) {
            name = nameArr[nameArr.length - 1] // drop module name if present
        }
        name = name.split('(')[0] // drop extra info
        vector = generateHash(name)
    }
    return vector
}
