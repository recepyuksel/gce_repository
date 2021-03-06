# Docker-compose

- Docker imagelerin oluşturulması için target klasörlerinden jar dosyalarının bu klasöre kopyalanması gerekmektedir. 
  Kopyalanacak dosyalar : 
  * crawling-0.0.1-SNAPSHOT.jar
  * data-service-0.0.1-SNAPSHOT.jar
  * information-extraction-0.0.1-SNAPSHOT.jar


- ``auth_config.json`` dosyasında   
  `"url": "http://127.0.0.1:8080/auth"`

  url  şu şekilde değiştirilmelidir: 
  
  `"url": "http://keycloak:8080/auth",`
  
  

- `C:\Windows\System32\drivers\etc\hosts` dosyasına  
  
  `127.0.0.1 keycloak` 

  satırının eklenmesi gerekmektedir.


- Docker imagelerin oluşturulması ve çalıştırılması için

    ````docker-compose up -d````
  
    komutu çalıştırılır.

