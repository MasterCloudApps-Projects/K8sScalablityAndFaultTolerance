/*package es.codeurjc.board.controller;

import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import es.codeurjc.board.model.Post;

@RestController
public class RedisController {

    private static final String KEY = "transactions";

    @Autowired
    private StringRedisTemplate template;
    
    @PostMapping("/{transaction}")
    public void addToSet(@PathVariable String transaction) {
        this.template.opsForSet().add(KEY, transaction);
    }

    @GetMapping("/get")
    public Set<String> getKeyValues() {
        return this.template.opsForSet().members(KEY);
    }

}*/
