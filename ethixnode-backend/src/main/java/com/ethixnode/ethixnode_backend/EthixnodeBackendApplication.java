package com.ethixnode.ethixnode_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EthixnodeBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(EthixnodeBackendApplication.class, args);
	}

}
