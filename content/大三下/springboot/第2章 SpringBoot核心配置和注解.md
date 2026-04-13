---
share: true
title: 第2章 SpringBoot核心配置和注解
created: 2026-03-22
source: Cherry Studio
tags:
---


# 第2章 SpringBoot核心配置和注解

## 2.1 全局配置文件

### properties与yaml配置文件
**定理1**: Spring Boot使用一个全局配置文件来集中管理应用的各项参数。这个文件通常位于`src/main/resources`目录下或类路径下的`/config`目录。主要有两种格式：`application.properties`和`application.yaml` (或 `.yml`)。

> 从初学者的角度来看，全局配置文件就像是应用的“设置中心”或“控制面板”。你可以在这里调整各种开关和参数，比如应用的端口号、数据库的连接地址等，而不需要去修改Java代码。这使得配置与代码分离，管理起来更加方便和清晰。

**定理2**: `application.properties`是传统的键值对格式，而`application.yaml`使用YAML（YAML Ain't Markup Language）格式，它以数据为核心，通过缩进表示层级关系，更具可读性，并且是JSON的超集。

> `properties`文件就像一个简单的清单，每行写一件事，如`server.port=8080`。而`yaml`文件则像一个思维导图或大纲，有层级结构，如：
>```yaml
> server:
>   port: 8080
> ```
> 这种结构能更直观地看出`port`是隶属于`server`的配置，当配置项很多时，`yaml`的优势会非常明显。如果两种文件同时存在，`properties`的优先级更高。

**例题1**: 在Spring Boot项目中将应用的端口号设置为8081，并设置访问路径为`/myapp`。请分别使用`properties`和`yaml`格式进行配置。
**解**:
**1. 使用 `application.properties`**
在`src/main/resources/application.properties`文件中添加以下内容：
```properties
server.port=8081
server.servlet.context-path=/myapp
```

**2. 使用 `application.yaml`**
在`src/main/resources/application.yaml`文件中添加以下内容：
```yaml
server:
port: 8081
servlet:
 context-path: /myapp
```

### YAML语法
**定理3**: YAML的语法核心是**缩进**和**冒号**。使用`key: value`的形式表示键值对，冒号后必须有一个空格。通过缩进的层级来表示对象的嵌套关系。

> YAML就像写一个结构化的大纲。每个标题（key）后面跟着它的内容（value）。如果一个标题下还有子标题，就通过增加缩进（通常是两个空格）来表示。

**例题2**: 在`application.yaml`中，如何表示普通数据、数组（List）和Map对象？
**解**:
**1. 普通数据类型 (字符串, 数字, 布尔值)**
直接使用`key: value`格式。
```yaml
server:
port: 8081 # 数字
path: /hello # 字符串
enabled: true # 布尔值
```

**2. 数组 (List/Collection)**
有两种写法：缩进式和行内式。

*   **缩进式**:
    ```yaml
    person:
      hobby:
        - play
        - read
        - sleep
    ```

*   **行内式**:
    ```yaml
    person:
      hobby: [play, read, sleep]
    ```

**3. Map或对象**
同样有两种写法：缩进式和行内式。

*   **缩进式**:
    ```yaml
    person:
      map:
        k1: v1
        k2: v2
    ```

*   **行内式**:
    ```yaml
    person:
      map: {k1: v1, k2: v2}
    ```

## 2.2 配置文件属性值注入

### 使用@ConfigurationProperties注入属性
**定理1**: `@ConfigurationProperties`注解可以将配置文件中以特定前缀（prefix）开头的一组属性，批量绑定到一个Java对象（POJO）的字段上。该Java类需要成为Spring容器中的一个Bean（通常通过`@Component`注解），并且必须为所有要绑定的字段提供标准的setter方法。

> `@ConfigurationProperties`就像一个自动填表工具。你定义一个Java类作为“表格模板”（有`id`, `name`等字段），然后在配置文件里填写好“表格内容”（`person.id=1`, `person.name=Tom`）。`@ConfigurationProperties(prefix="person")`会自动读取`person`前缀下的所有属性，并调用setter方法将它们填充到Java对象的对应字段中。

**例题1**: 创建一个`Person`类，并将其属性通过`application.properties`进行配置，然后使用`@ConfigurationProperties`进行注入。
**解**:
**步骤1**: 在`application.properties`中配置person属性。
```properties
person.id=1
person.name=zhangsan
person.hobbies=reading,coding,gaming
person.family.father=f
person.family.mother=m
```
**步骤2**: 创建`Person`类，并使用`@Component`和`@ConfigurationProperties`。
```java
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;

@Component
@ConfigurationProperties(prefix = "person")
public class Person {
 private int id;
 private String name;
 private List<String> hobbies;
 private Map<String, String> family;

 // 必须提供setter方法用于属性注入
 public void setId(int id) { this.id = id; }
 public void setName(String name) { this.name = name; }
 public void setHobbies(List<String> hobbies) { this.hobbies = hobbies; }
 public void setFamily(Map<String, String> family) { this.family = family; }

 @Override
 public String toString() {
 return "Person{" + "id=" + id + ", name='" + name + '\'' + ", hobbies=" + hobbies + ", family=" + family + '}';
 }
}
```
**步骤3**: 在测试类中注入`Person`对象并验证。
```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class MyTest {
 @Autowired
 private Person person;

 @Test
 public void testPerson() {
 System.out.println(person);
 // 输出: Person{id=1, name='zhangsan', hobbies=[reading, coding, gaming], family={father=f, mother=m}}
 }
}
```

### 使用@Value注入属性
**定理2**: `@Value`注解是Spring框架提供的功能，用于将配置文件中的单个属性值、默认值、或SpEL表达式的结果注入到类的字段或方法参数上。它使用`${property.key}`的占位符语法。

> `@Value`就像一个精确的滴管，它一次只取一个配置项，然后精准地注入到一个变量中。与`@ConfigurationProperties`的批量操作不同，`@Value`是“指哪打哪”的单个注入。

**例题2**: 使用`@Value`注解将`person.name`和`person.id`注入到`Person`类的字段中。
**解**:
**步骤1**: `application.properties`配置保持不变。
```properties
person.id=1
person.name=zhangsan
```
**步骤2**: 创建`Person`类，并使用`@Value`注解。
```java
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class Person {
 @Value("${person.id}")
 private int id;

 @Value("${person.name}")
 private String name;

 // 使用@Value进行字段注入时，可以不提供setter方法

 @Override
 public String toString() {
 return "Person{" + "id=" + id + ", name='" + name + '\'' + '}';
 }
}
```
**步骤3**: 测试方法与上例相同，注入`Person`对象并打印，会得到相应的结果。

### @ConfigurationProperties vs. @Value
**定理3**: `@ConfigurationProperties`和`@Value`是两种不同的属性注入方式，各有优缺点和适用场景。

> 总结一下：如果你需要把一整个模块的配置（比如数据源的所有配置）映射成一个配置对象，用`@ConfigurationProperties`，它功能强大，支持校验和松散绑定，更像是在做“面向对象”的配置。如果你只是想取一两个零散的配置项，或者需要使用SpEL表达式的动态能力，用`@Value`更方便快捷。

| 对比点 | @ConfigurationProperties | @Value |
| :--- | :--- | :--- |
| **功能** | 批量注入，将一个前缀下的属性映射到一个对象 | 单个属性注入 |
| **setter方法** | **需要** | **不需要** (字段注入时) |
| **复杂类型** | **支持** (如`Map`, `List`, 嵌套对象) | **不支持** (注入复杂类型非常繁琐) |
| **松散绑定** | **支持** (如`first-name`可映射到`firstName`) | **不支持** (必须精确匹配属性名) |
| **数据校验** | **支持** (结合JSR303注解, 如`@Validated`) | **不支持** |
| **SpEL表达式** | **不支持** | **支持** (如`@Value("#{1+2}")`) |

## 2.3 Spring Boot自定义配置

### 使用@PropertySource加载配置文件
**定理1**: `@PropertySource`注解用于加载指定的`.properties`文件到Spring的`Environment`中。它可以与`@Configuration`和`@ConfigurationProperties`结合使用，从而加载非全局配置文件（即不是`application.properties`）中的属性。

> 当你不想把所有的配置都堆在`application.properties`里时，比如你想把数据库的配置单独放在`db.properties`文件中，`@PropertySource("classpath:db.properties")`就派上用场了。它告诉Spring：“除了默认的`application.properties`，请再去加载一下`db.properties`这个文件里的配置。”

**例题1**: 创建一个`test.properties`文件，并通过`@PropertySource`加载它，将其中的属性注入到一个配置类中。
**解**:
**步骤1**: 在`src/main/resources`下创建`test.properties`文件。
```properties
myconfig.id=110
myconfig.name=custom-config
```
**步骤2**: 创建一个配置属性类，并使用注解加载该文件。
```java
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource("classpath:test.properties") // 1. 指定加载的配置文件
@ConfigurationProperties(prefix = "myconfig") // 2. 指定绑定的前缀
public class MyProperties {
 private int id;
 private String name;

 // Getters and Setters ...
 public void setId(int id) { this.id = id; }
 public void setName(String name) { this.name = name; }

 @Override
 public String toString() {
 return "MyProperties{" + "id=" + id + ", name='" + name + '\'' + '}';
 }
}
```
> 注意: PDF中的`@EnableConfigurationProperties`用在这里是多余的，因为`@Configuration`已经使`MyProperties`成为一个Bean，`@ConfigurationProperties`会自动生效。`@EnableConfigurationProperties(MyProperties.class)`通常用在希望启用`MyProperties`但它本身不是一个`@Component`或`@Configuration` bean的场景。

**步骤3**: 编写测试类进行验证。
```java
@Autowired
private MyProperties myProperties;

@Test
public void myPropertiesTest() {
 System.out.println(myProperties);
 // 输出: MyProperties{id=110, name='custom-config'}
}
```

### 使用@ImportResource加载XML配置文件
**定理2**: `@ImportResource`注解用于加载Spring传统的XML配置文件（如`beans.xml`），将XML中定义的Bean加载到Spring Boot应用的上下文中。这是为了兼容旧的基于XML配置的项目。

> 如果你接手一个老项目，里面有很多通过XML配置的Bean，你不想重写它们。`@ImportResource("classpath:beans.xml")`就像一个“转换插头”，能让你把这些旧的XML配置直接“插”到新的Spring Boot应用中使用。

**例题2**: 通过XML文件定义一个Bean，并使用`@ImportResource`将其加载到Spring容器中。
**解**:
**步骤1**: 创建一个简单的服务类`MyService`。
```java
package com.example.config;
public class MyService {
 public void sayHello() {
 System.out.println("Hello from XML bean!");
 }
}
```
**步骤2**: 在`src/main/resources`下创建`beans.xml`。
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

 <bean id="myService" class="com.example.config.MyService" />
</beans>
```
**步骤3**: 在主启动类上添加`@ImportResource`注解。
```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ImportResource;

@SpringBootApplication
@ImportResource("classpath:beans.xml") // 加载XML配置文件
public class DemoApplication {
 public static void main(String[] args) {
 SpringApplication.run(DemoApplication.class, args);
 }
}
```
**步骤4**: 在测试类中验证Bean是否被加载。
```java
@Autowired
private ApplicationContext applicationContext;

@Test
public void iocTest() {
 boolean contains = applicationContext.containsBean("myService");
 System.out.println(contains); // 输出: true
}
```

### 使用@Configuration编写自定义配置类
**定理3**: `@Configuration`注解声明一个类为配置类，`@Bean`注解用于方法上，声明该方法返回的对象是一个需要注册到Spring容器中的Bean。这是Spring Boot推荐的Java配置方式，完全替代了XML配置。

> `@Configuration` + `@Bean`是现代Spring应用的标准配置方式。`@Configuration`告诉Spring：“这是一个配置蓝图类”。类里面的每个`@Bean`方法就像蓝图上的一个组件制造指令，告诉Spring：“请调用这个方法，把它返回的对象当作一个Bean来管理”。

**例题3**: 使用`@Configuration`和`@Bean`来代替XML，将`MyService`注册为Bean。
**解**:
**步骤1**: `MyService`类保持不变。
**步骤2**: 在主启动类上**移除或注释掉**`@ImportResource("classpath:beans.xml")`注解。
**步骤3**: 创建一个Java配置类`MyConfig`。
```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.example.config.MyService;

@Configuration // 声明这是一个配置类
public class MyConfig {

 @Bean // 将该方法的返回值注册为一个Bean
 public MyService myService() {
 return new MyService();
 }
}
```
**步骤4**: 运行与上例完全相同的测试方法`iocTest()`。
```java
@Test
public void iocTest() {
 boolean contains = applicationContext.containsBean("myService");
 System.out.println(contains); // 同样输出: true
}
```
这证明了`@Configuration`和`@Bean`成功地替代了XML配置。

## 2.4 Profile多环境配置

### Profile多环境配置
**定理1**: Profile是Spring提供的一种能力，用于根据不同的环境（如开发`dev`、测试`test`、生产`prod`）激活不同的配置。这解决了在不同环境中需要手动修改配置的痛点。

> 在软件开发中，你的代码会经历多个阶段：在你的电脑上开发（dev），交给测试人员测试（test），最后上线给用户使用（prod）。每个阶段的配置（如数据库地址）都不同。Profile就像是为应用准备了多套“服装”，你可以通过一个简单的开关告诉它今天该穿哪一套（激活哪个环境），而不需要每次都手动去换。

**定理2**: 实现Profile配置主要有两种方式：基于文件的多环境配置和基于`@Profile`注解的配置。激活特定环境的配置通常在主配置文件`application.properties`中通过`spring.profiles.active=环境标识`来设置。

### 使用Profile文件进行多环境配置
**定理3**: 多环境配置文件的命名遵循`application-{profile}.properties`的格式，其中`{profile}`是环境标识符（如`dev`, `prod`）。

> 这种方式最直观。你为每个环境创建一个专属的配置文件。
> - `application-dev.properties`：开发环境用的，连本地数据库。
> - `application-prod.properties`：生产环境用的，连线上数据库。
> 然后在`application.properties`里写上`spring.profiles.active=dev`，Spring Boot就会去加载`application.properties`和`application-dev.properties`，并且`dev`文件里的配置会覆盖主文件里的同名配置。

**例题1**: 为项目配置开发(dev)和生产(prod)两套环境，开发环境端口为8081，生产环境为8080。
**解**:
**步骤1**: 创建`application-dev.properties`。
```properties
server.port=8081
```
**步骤2**: 创建`application-prod.properties`。
```properties
server.port=8080
```
**步骤3**: 在主配置文件`application.properties`中激活`dev`环境。
```properties
spring.profiles.active=dev
```
**步骤4**: 启动应用，应用将在8081端口运行。如果想切换到生产环境，只需将`spring.profiles.active`的值改为`prod`再重启即可。也可以通过命令行参数覆盖此设置：`java -jar myapp.jar --spring.profiles.active=prod`。

### 使用@Profile注解进行多环境配置
**定理4**: `@Profile`注解可以作用于`@Component`或`@Configuration`类上，表示只有当指定的profile被激活时，这个类才会被加载到Spring容器中。

> `@Profile`注解就像给Bean贴上了一个环境标签。比如，你给一个配置类贴上`@Profile("dev")`的标签，那么只有在开发环境（`spring.profiles.active=dev`）下，这个配置类和它里面的所有`@Bean`才会生效。这对于定义不同环境下的特定Bean非常有用。

**例题2**: 创建两个数据库配置Bean，一个用于dev，一个用于prod，通过`@Profile`注解使其在不同环境下生效。
**解**:
**步骤1**: 在`application.properties`中设置激活的环境。
```properties
spring.profiles.active=dev
```
**步骤2**: 创建一个配置类，包含两个用`@Profile`注解区分的Bean。
```java
@Configuration
public class DataSourceConfig {

 @Bean
 @Profile("dev")
 public String devDataSource() {
 System.out.println("开发环境数据源Bean已加载！");
 return "devDataSource";
 }

 @Bean
 @Profile("prod")
 public String prodDataSource() {
 System.out.println("生产环境数据源Bean已加载！");
 return "prodDataSource";
 }
}
```
**步骤3**: 启动应用，观察控制台输出。
- 当`spring.profiles.active=dev`时，控制台会打印 "开发环境数据源Bean已加载！"。
- 当`spring.profiles.active=prod`时，控制台会打印 "生产环境数据源Bean已加载！"。

## 2.5 随机值设置以及参数间引用

### 随机值设置
**定理1**: Spring Boot允许在配置文件中使用`${random.xxx}`的语法来生成各种类型的随机值，并将它们注入到配置属性中。

> 有时候在测试或配置中需要一些随机数，比如随机端口、随机密钥等。Spring Boot的`${random.*}`语法提供了一个便捷的内置随机数生成器，你不需要在Java代码里写`new Random()`了，直接在配置文件里声明即可。

**例题1**: 在配置文件中生成一个随机整数、UUID和一个1024到65536之间的随机端口号。
**解**:
在`application.properties`中添加以下配置：
```properties
my.secret=${random.value} # 随机长字符串
my.number=${random.int} # 随机整数
my.bignumber=${random.long} # 随机长整数
my.uuid=${random.uuid} # 随机UUID
my.number.less.than.ten=${random.int(10)} # 10以内的随机整数
my.number.in.range=${random.int[1024,65536]} # [1024, 65536]范围内的随机整数
```
可以通过`@Value`注解将这些属性注入到代码中进行验证。

### 参数间引用
**定理2**: 在配置文件中，可以使用`${property.name}`的语法引用前面已经定义过的属性值。

> 这有助于保持配置的“DRY”（Don't Repeat Yourself）原则。比如你定义了一个应用名称`app.name=MyApp`，后面很多地方的描述都需要用到这个名字，你就可以写`app.description=${app.name} is a great app.`。这样，当需要修改应用名称时，只需改一处地方，所有引用它的地方都会自动更新。

**例题2**: 结合随机值和参数引用，生成一个随机年龄，并在一句描述中引用这个年龄。
**解**:
**步骤1**: 在`application.properties`中设置属性。
```properties
tom.age=${random.int[10,20]}
# 引用上面刚刚定义的tom.age属性
tom.description=Tom's age might be ${tom.age}.
```
**步骤2**: 在测试类中注入`tom.description`并进行测试。
```java
@Value("${tom.description}")
private String description;

@Test
public void placeholderTest() {
 System.out.println(description);
}
```
**步骤3**: 运行测试。控制台可能会输出 `Tom's age might be 15.`。每次运行，年龄数字可能会变，但描述中的数字和`tom.age`的值总是一致的。
