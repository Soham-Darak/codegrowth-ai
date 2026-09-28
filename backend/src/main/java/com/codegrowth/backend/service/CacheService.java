package com.codegrowth.backend.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class CacheService {
    private final StringRedisTemplate redisTemplate;
    private static final Duration TTL = Duration.ofMinutes(30);

    public CacheService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public String get(String key) {
        try {
            return redisTemplate.opsForValue().get(key);
        } catch (Exception e) {
            return null;
        }
    }

    public void set(String key, String value) {
        try {
            redisTemplate.opsForValue().set(key, value, TTL);
        } catch (Exception e) {
            // Ignore cache write failure
        }
    }
}
