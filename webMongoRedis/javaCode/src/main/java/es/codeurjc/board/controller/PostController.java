package es.codeurjc.board.controller;

import static org.springframework.web.servlet.support.ServletUriComponentsBuilder.fromCurrentRequest;

import java.net.URI;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Bean;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.codeurjc.board.model.Post;
import es.codeurjc.board.service.PostService;

@RestController
@RequestMapping("/posts")
public class PostController {

	@Autowired
	private PostService posts;

	@GetMapping("/")
	@Cacheable(value="post")
	public List<Post> getPosts() {
		return posts.findAll();
	}

	@GetMapping("/{id}")
	@Cacheable(value="post", key="#id")
	public Post getPost(@PathVariable String id) {

		return posts.findById(id).orElseThrow();
	}

	@PostMapping("/")
	//@Cacheable(value="post")
	public ResponseEntity<Post> createPost(@RequestBody Post post) {

		posts.save(post);

		URI location = fromCurrentRequest().path("/{id}").buildAndExpand(post.getId()).toUri();

		return ResponseEntity.created(location).body(post);
	}

	@PutMapping("/{id}")
	@CachePut(value="post", key="#newPost.id")
	public Post replacePost(@RequestBody Post newPost, @PathVariable String id) {

		newPost.setId(id);

		posts.replace(newPost);

		return newPost;
	}

	@DeleteMapping("/{id}")
	@CacheEvict(value="post", key="#id")
	public Post deletePost(@PathVariable String id) {

		Post post = posts.findById(id).orElseThrow();

		posts.deleteById(id);

		return post;
	}
}
