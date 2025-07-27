-- lib/kv.lua
local M = {}

-- Private module state
local persistent_store = {}
local cache = {}
local cache_count = 0
local max_cache_size = 1000
local TOMBSTONE = {}

-- Retrieve value for a key
function M.get(key)
    if cache[key] == TOMBSTONE then
        return nil
    elseif cache[key] ~= nil then
        return cache[key]
    end
    return persistent_store[key]
end

-- Set value for a key
function M.set(key, value)
    local was_cached = cache[key] ~= nil
    cache[key] = value
    
    if not was_cached then
        cache_count = cache_count + 1
        if cache_count >= max_cache_size then
            M.flush()
        end
    end
end

-- Delete a key
function M.delete(key)
    local was_cached = cache[key] ~= nil
    cache[key] = TOMBSTONE
    
    if not was_cached then
        cache_count = cache_count + 1
        if cache_count >= max_cache_size then
            M.flush()
        end
    end
end

-- Flush all pending writes to persistent storage
function M.flush()
    for key, value in pairs(cache) do
        if value == TOMBSTONE then
            persistent_store[key] = nil
        else
            persistent_store[key] = value
        end
    end
    
    -- Reset cache state
    cache = {}
    cache_count = 0
end

return M
