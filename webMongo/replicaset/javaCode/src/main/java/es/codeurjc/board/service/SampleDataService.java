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
		posts.save(new Post("Luis", "Compro furgoneta", "Pago mucho"));
		posts.save(new Post("Ana", "Compro moto", "Nueva"));
		posts.save(new Post("Hugo", "Vendo coche", "Segunda mano"));
		posts.save(new Post("Marta", "Vendo moto", "A estrenar"));
		posts.save(new Post("Pedro", "Vendo casa", "Recien pintada"));
		posts.save(new Post("Alba", "Busco coche grande", "Familia"));
		posts.save(new Post("Sandra", "Vendo smart", "Seminuevo"));
		posts.save(new Post("Mario", "Compro bici", "Grande"));
		
	}
	
}
