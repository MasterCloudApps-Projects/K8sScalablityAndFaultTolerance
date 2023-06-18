package cacheconfigurations;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.hazelcast.config.Config;
import com.hazelcast.config.EvictionConfig;
import com.hazelcast.config.EvictionPolicy;
import com.hazelcast.config.MapConfig;
import com.hazelcast.core.Hazelcast;
import com.hazelcast.core.HazelcastInstance;
//import com.hazelcast.config.MaxSizeConfig;

@Configuration
public class PostCacheConfig {
	
	@Bean
	public Config cacheConfig() {
		return new Config()
				.setInstanceName("hazel-instance")
				.addMapConfig(new MapConfig()
						.setName("posts")
						.setTimeToLiveSeconds(5000)
//						.setMaxSizeConfig(new MaxSizeConfig(200,com.hazelcast.config.MaxSizeConfig.MaxSizePolicy.FREE_HEAP_SIZE))
//						.setEvictionPolicy(EvictionPolicy.LRU)
						);
				}

}
