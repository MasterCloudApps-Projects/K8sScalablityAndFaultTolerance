package es.codeurjc.board;

import javax.cache.Cache;
import javax.cache.CacheManager;
import javax.cache.Caching;
import javax.cache.configuration.CompleteConfiguration;
import javax.cache.configuration.MutableConfiguration;
import javax.cache.spi.CachingProvider;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;


@SpringBootApplication
@EnableCaching
public class Application {
	
//	CachingProvider cachingProvider = Caching.getCachingProvider();
//	CacheManager cacheManager = cachingProvider.getCacheManager();
//	CompleteConfiguration<String, String> config =
//            new MutableConfiguration<String, String>()
//                    .setTypes( String.class, String.class );
//	Cache<String, String> cache = cacheManager.createCache( "posts", config );
		
	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}
}
