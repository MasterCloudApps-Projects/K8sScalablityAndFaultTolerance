package es.codeurjc.board.controller;

import static org.springframework.web.servlet.support.ServletUriComponentsBuilder.fromCurrentRequest;

import java.io.IOException;
import java.net.URI;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

import org.hibernate.engine.jdbc.BlobProxy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import es.codeurjc.board.model.Post;
import es.codeurjc.board.service.PostService;

@RestController
@RequestMapping("/posts")
public class PostController {

	@Autowired
	private PostService posts;

	@GetMapping("/")
	public List<Post> getPosts() {
		return posts.findAll();
	}

	@GetMapping("/{id}")
	public  ResponseEntity<Post> getPost(@PathVariable long id) {

		Optional<Post> post = posts.findById(id);
		 if (post.isPresent()) {
		 return ResponseEntity.ok(post.get());
		 } else {
		 return ResponseEntity.notFound().build();
		 }
	}

	@PostMapping("/")
	public ResponseEntity<Post> createPost(@RequestBody Post post) {

		posts.save(post);

		URI location = fromCurrentRequest().path("/{id}").buildAndExpand(post.getId()).toUri();

		return ResponseEntity.created(location).body(post);
	}

	@PutMapping("/{id}")
	public Post replacePost(@RequestBody Post newPost, @PathVariable long id) {

		newPost.setId(id);

		posts.replace(newPost);

		return newPost;
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Post> deletePost(@PathVariable long id) {

		Optional<Post> post = posts.findById(id);

		if (post.isPresent()) {
			posts.deleteById(id);
			return ResponseEntity.ok(post.get());
		} else {
			return ResponseEntity.notFound().build();
		}
	}

}
