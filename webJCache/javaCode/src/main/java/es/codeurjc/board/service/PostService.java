package es.codeurjc.board.service;

import java.util.List;
//import java.util.Optional;
import java.util.Optional;

import javax.cache.annotation.CacheResult;
import javax.persistence.Cacheable;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import es.codeurjc.board.model.Post;
import es.codeurjc.board.repository.PostRepository;

@Service
public class PostService {
	
	@Autowired
	private PostRepository posts;

	public void save(Post post) {
		posts.save(post);		
	}
	
	@CacheResult(cacheName = "posts")
	public List<Post> findAll() {
		return posts.findAll();
	}
	
	@CacheResult(cacheName = "posts")
//	@Cacheable(value="posts",key="#id")
	public Optional<Post> findById(long id) {
		return findPostInSlowSource(id);
    }

    private Optional<Post> findPostInSlowSource(long id) {
        return posts.findById(id);
    }
	
	public void replace(Post updatedPost) {

		posts.findById(updatedPost.getId()).orElseThrow();

		posts.save(updatedPost);		
	}

	public void deleteById(long id) {
		
		posts.deleteById(id);		
	}
	
}
