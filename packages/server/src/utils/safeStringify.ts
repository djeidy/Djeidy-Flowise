/**
 * Safely stringify large objects to prevent memory issues
 * This utility helps prevent JavaScript heap out of memory errors
 * when stringifying large objects
 */

/**
 * Safely stringify an object with a maximum depth to prevent memory issues
 * @param obj The object to stringify
 * @param maxDepth Maximum depth to traverse (default: 10)
 * @param space Indentation spaces (default: 0)
 * @returns Stringified object
 */
export function safeStringify(obj: any, maxDepth = 10, space = 0): string {
    // Track objects to detect circular references
    const seen = new WeakSet()
    
    return JSON.stringify(
        obj,
        (key, value) => {
            // Handle circular references
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return '[Circular Reference]'
                }
                seen.add(value)
            }
            
            // Handle depth limitation
            if (maxDepth <= 0 && typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    return '[Array]'
                } else {
                    return '[Object]'
                }
            }
            
            // Recursively process objects with reduced depth
            if (typeof value === 'object' && value !== null) {
                if (maxDepth > 0) {
                    return Object.fromEntries(
                        Object.entries(value).map(([k, v]) => {
                            if (typeof v === 'object' && v !== null) {
                                try {
                                    return [k, JSON.parse(safeStringify(v, maxDepth - 1))]
                                } catch (e) {
                                    return [k, '[Stringification Error]']
                                }
                            }
                            return [k, v]
                        })
                    )
                }
            }
            
            return value
        },
        space
    )
}

/**
 * Safely parse a JSON string with error handling
 * @param str The string to parse
 * @param defaultValue Default value to return if parsing fails
 * @returns Parsed object or default value
 */
export function safeParse(str: string, defaultValue: any = {}): any {
    try {
        return JSON.parse(str)
    } catch (e) {
        console.error('Error parsing JSON:', e)
        return defaultValue
    }
}
