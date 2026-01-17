---
share: true
---
![[./assets/第7章 Spring中的Bean的管理/file-20260111144950404.png|file-20260111144950404.png]]

# 第7章 Spring中的Bean的管理

## 7.1 Spring IoC容器

Spring 框架的核心是 IoC（Inversion of Control，控制反转）容器。Bean 是注册到 Spring 容器中的 Java 类，由 Spring 进行管理。

### 7.1.1 BeanFactory接口
**BeanFactory** 是 Spring 框架的顶层接口，定义了 IoC 容器的基本功能。它提供了解析 XML 配置文件、管理 Bean 的生命周期和维护 Bean 依赖关系等基本功能。

**BeanFactory 接口的常用方法**：
| 方法名称 | 描述 |
| :--- | :--- |
| `getBean(String name)` | 根据 Bean 的名称（id 或 name）获取 Bean 实例。 |
| `getBean(String name, Class<T> type)` | 根据 Bean 的名称和类型获取 Bean 实例。 |
| `<T> T getBean(Class<T> requiredType)` | 根据 Bean 的类型获取 Bean 实例。 |
| `boolean containsBean(String name)` | 判断 Spring 容器中是否包含指定名称的 Bean。 |
| `boolean isSingleton(String name)` | 判断指定名称的 Bean 是否为单例。 |
| `boolean isTypeMatch(String name, ResolvableType type)` | 判断指定名称的 Bean 是否匹配指定的类型。 |
| `Class<?> getType(String name)` | 获取指定名称的 Bean 的类型。 |
| `String[] getAliases(String name)` | 获取指定名称的 Bean 的所有别名。 |

**XmlBeanFactory**：
`XmlBeanFactory` 是 `BeanFactory` 接口的一个常用实现类（已过时，但在学习原理时仍有意义），用于读取 XML 配置文件。
```java
// 语法格式
BeanFactory beanFactory = new XmlBeanFactory(new FileSystemResource("D:/bean.xml"));
```

### 7.1.2 ApplicationContext接口
**ApplicationContext**（应用上下文）接口建立在 `BeanFactory` 接口之上，提供了更丰富的功能，如国际化支持、资源访问、事件传播等。它是 Spring 框架中更常用的 IoC 容器接口。

> ApplicationContext 可以为**单例** (Singleton) 的 Bean 实行**预初始化**（即在容器启动时就创建 Bean），提升了程序获取 Bean 实例的性能。

**ApplicationContext 接口的常用实现类**：
| 类名称 | 描述 |
| :--- | :--- |
| `ClassPathXmlApplicationContext` | 从**类路径**（classpath）加载 XML 配置文件，实例化 ApplicationContext。 |
| `FileSystemXmlApplicationContext` | 从**文件系统**（磁盘路径）加载 XML 配置文件，实例化 ApplicationContext。 |
| `AnnotationConfigApplicationContext` | 从**注解**配置类加载配置，实例化 ApplicationContext。 |
| `WebApplicationContext` | 在 Web 应用中使用，从相对于 Web 根目录的路径加载配置文件。 |

## 7.2 Bean的配置

Spring 容器支持 XML 和 Properties 两种格式的配置文件，最常用的是 XML。XML 配置文件的根元素是 `<beans>`，其中包含多个 `<bean>` 子元素。

### `<bean>` 元素的常用属性
| 属性 | 描述 |
| :--- | :--- |
| `id` | Bean 的唯一标识符。Spring 容器通过 id 管理 Bean，装配时也根据 id 获取对象。 |
| `name` | 为 Bean 指定多个名称（别名），名称之间可以用逗号、分号或空格隔开。 |
| `class` | 指定 Bean 的具体实现类的全限定名（包名+类名）。 |
| `scope` | 设定 Bean 实例的作用域。可选值：`singleton`, `prototype`, `request`, `session`, `global session`。 |

### `<bean>` 元素的常用子元素
| 元素 | 描述 |
| :--- | :--- |
| `<constructor-arg>` | 用于**构造方法注入**，为 Bean 的属性指定值。 |
| `<property>` | 用于**属性 setter 方法注入**，调用 Bean 实例的 setter 方法完成属性赋值。 |
| `<ref>` | `<property>` 等元素的属性或子元素，用于指定 Bean 工厂中某个 Bean 实例的**引用**。 |
| `<value>` | `<property>` 等元素的属性或子元素，用于直接指定一个**常量值**。 |
| `<list>`, `<set>`, `<map>`, `<entry>` | 用于注入集合类型的属性值（List, Set, Map）。 |

## 7.3 Bean的实例化

Spring 容器实例化 Bean 有三种方式：构造方法实例化、静态工厂实例化和实例工厂实例化。

### 7.3.1 构造方法实例化
这是最常用的方式，Spring 容器通过调用 Bean 类的**无参构造方法**来创建实例。

**配置示例**：
```xml
<bean id="bean1" class="com.itheima.Bean1"></bean>
```
**Java 代码**：
```java
public class Bean1 {
    public Bean1() {
        System.out.println("这是Bean1");
    }
}
```

### 7.3.2 静态工厂实例化
通过调用工厂类的**静态方法**来创建 Bean 实例。

**配置示例**：
```xml
<!-- class 指定工厂类，factory-method 指定静态工厂方法 -->
<bean id="bean2" class="com.itheima.MyBean2Factory" factory-method="createBean"/>
```
**Java 代码**：
```java
public class MyBean2Factory {
    public static Bean2 createBean() {
        return new Bean2();
    }
}
```

### 7.3.3 实例工厂实例化
先实例化工厂类，再通过调用工厂实例的**普通方法**来创建 Bean 实例。

**配置示例**：
```xml
<!-- 1. 配置工厂 Bean -->
<bean id="myBean3Factory" class="com.itheima.MyBean3Factory" />
<!-- 2. 配置目标 Bean，使用 factory-bean 指定工厂 Bean，factory-method 指定工厂方法 -->
<bean id="bean3" factory-bean="myBean3Factory" factory-method="createBean" />
```
**Java 代码**：
```java
public class MyBean3Factory {
    public Bean3 createBean() {
        return new Bean3();
    }
}
```

## 7.4 Bean的作用域

Spring 支持 5 种作用域，通过 `<bean>` 元素的 `scope` 属性指定。

| 作用域 | 描述 |
| :--- | :--- |
| **singleton** | **单例模式**（默认）。Spring 容器中只会存在**一个共享的 Bean 实例**。 |
| **prototype** | **原型模式**。每次从容器中请求 Bean 时，都会产生一个**新的实例**。 |
| **request** | 每一个 HTTP 请求都会产生一个新的 Bean 实例（仅在 Web 应用中有效）。 |
| **session** | 每一个 HTTP Session 都会产生一个新的 Bean 实例（仅在 Web 应用中有效）。 |
| **global session** | 全局 Session 作用域（仅在 Portlet 环境中有效）。 |

**配置示例**：
```xml
<bean id="bean1" class="com.itheima.Bean1" scope="singleton"></bean>
<bean id="bean2" class="com.itheima.Bean2" scope="prototype"></bean>
```

## 7.5 Bean的装配方式

Bean 的装配就是指依赖注入（Dependency Injection），即让 Spring 容器将 Bean 依赖的对象或值注入到 Bean 中。

### 7.5.1 基于 XML 的装配
Spring 提供了两种基于 XML 的装配方式：

1.  **属性 setter 方法注入**（主流）：
    *   要求：Bean 类必须提供**无参构造方法**，并为属性提供 **setter 方法**。
    *   配置：使用 `<property>` 元素。
    ```xml
    <bean id="user2" class="com.itheima.User2">
        <property name="id" value="2" />
        <property name="name" value="李四" />
    </bean>
    ```

2.  **构造方法注入**：
    *   要求：Bean 类提供带参构造方法。
    *   配置：使用 `<constructor-arg>` 元素。
    ```xml
    <bean id="user1" class="com.itheima.User1">
        <constructor-arg name="id" value="1" />
        <constructor-arg name="name" value="张三" />
    </bean>
    ```

### 7.5.2 基于注解的装配
使用注解可以减少 XML 配置，使代码更加简洁。

**常用注解**：
| 注解 | 描述 |
| :--- | :--- |
| `@Component` | 标识一个普通的 Bean。 |
| `@Controller` | 标识**控制层**（Controller）组件。 |
| `@Service` | 标识**业务逻辑层**（Service）组件。 |
| `@Repository` | 标识**数据访问层**（DAO）组件。 |
| `@Scope` | 指定 Bean 的作用域。 |
| `@Value` | 注入普通属性值。 |
| `@Autowired` | **按类型**自动装配。 |
| `@Qualifier` | 结合 `@Autowired` 使用，**按名称**装配。 |
| `@Resource` | (JDK 注解) 默认**按名称**装配，找不到则按类型。 |
| `@PostConstruct` | 指定初始化方法。 |
| `@PreDestroy` | 指定销毁方法。 |

**启用注解扫描**：
在 XML 配置文件中添加 context 约束并开启组件扫描：
```xml
<context:component-scan base-package="com.itheima" />
```

### 7.5.3 自动装配 (XML)
通过 `<bean>` 元素的 `autowire` 属性实现自动装配。

| 属性值 | 描述 |
| :--- | :--- |
| `byName` | 根据属性名自动装配。查找容器中 id 与属性名一致的 Bean。 |
| `byType` | 根据属性类型自动装配。查找容器中类型匹配的 Bean。 |
| `constructor` | 类似于 `byType`，但应用于构造函数参数。 |
| `no` | 默认值，不使用自动装配。 |

## 7.6 Bean的生命周期

Bean 的生命周期指 Bean 实例被创建、初始化和销毁的过程。

1.  **singleton 作用域**：Spring 容器管理整个生命周期（创建 -> 初始化 -> 销毁）。
2.  **prototype 作用域**：Spring 容器只负责创建，不管理生命周期（创建 -> 初始化 -> 客户端自行管理）。

**生命周期的关键时间节点监控**：
*   **初始化后**：Bean 属性设置完毕后执行。
    *   XML：`<bean init-method="init">`
    *   注解：`@PostConstruct`
*   **销毁前**：容器关闭前执行（仅限 singleton）。
    *   XML：`<bean destroy-method="destroy">`
    *   注解：`@PreDestroy`

**示例代码**：
```java
@Component("student")
public class Student {
    @PostConstruct
    public void init() {
        System.out.println("Bean初始化完成");
    }
    @PreDestroy
    public void destroy() {
        System.out.println("Bean销毁前");
    }
}
```
**注意**：在 `main` 方法中测试销毁方法时，需要手动调用 `AbstractApplicationContext` 的 `registerShutdownHook()` 方法来关闭容器。