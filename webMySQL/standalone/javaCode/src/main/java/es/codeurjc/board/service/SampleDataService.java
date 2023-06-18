package es.codeurjc.board.service;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.codeurjc.board.model.Post;

@Service
@Transactional
public class SampleDataService {

	@Autowired
	private PostService posts; 
	
	@PostConstruct
	public void init() {

		//posts.save(new Post("Pepe", "Vendo moto", "Barata, barata"));
		//posts.save(new Post("Juan", "Compro coche", "Pago bien"));
	}
	
}
