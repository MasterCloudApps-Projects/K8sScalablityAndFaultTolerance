package es.codeurjc.board.service;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import es.codeurjc.board.model.Post;

@Service
public class SampleDataService {

	@Autowired
	private PostService posts; 
	
	@PostConstruct
	public void init() {

		posts.save(new Post("Pepe", "Vendo moto", "Barata, barata"));
		posts.save(new Post("Juan", "Compro coche", "Pago bien"));
		posts.save(new Post("Luis", "Compro monovolumen", "Grande"));
		posts.save(new Post("Mario", "Vendo furgoneta", "Nueva"));
		posts.save(new Post("Ana", "Compro furgoneta", "Camperizada"));
		posts.save(new Post("Pedro", "Vendo smart", "Recien pintado"));
		posts.save(new Post("Alba", "Busco coche grande", "Para familia"));
		posts.save(new Post("Sandra", "Busco coche familiar", "Segunda mano"));
		posts.save(new Post("Hugo", "Vendo coche", "Siete años"));
		posts.save(new Post("Edu", "Busco bici", "Montaña"));
	}
	
}
