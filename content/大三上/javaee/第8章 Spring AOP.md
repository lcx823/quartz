---
share: true
---
![[./assets/第8章 Spring AOP/file-20260111145112380.png|file-20260111145112380.png]]

# 第8章 Spring AOP

## 8.1 Spring AOP介绍

### 8.1.1 Spring AOP概述
**AOP (Aspect Oriented Programming)**，即面向切面编程。

**AOP 与 OOP 的区别**：
*   **OOP (Object Oriented Programming)**：通过继承、封装和多态构建对象的层次结构。但在处理横切关注点（如事务管理、日志记录）时，代码会分散在各个方法中，导致代码重复和耦合。
*   **AOP**：主张将程序中相同的业务逻辑（关注点）进行横向隔离，并将重复的业务逻辑抽取到一个独立的模块（切面）中。

**优势**：
1.  **降低耦合**：将通用业务逻辑（事务、日志等）从核心业务逻辑中剥离，降低横向业务逻辑之间的耦合。
2.  **减少重复代码**：通用逻辑只需编写一次，复用性高。
3.  **提高开发效率和可维护性**：开发人员专注于核心业务，通用逻辑由 AOP 统一处理。

> AOP 就像是给系统穿了一层“盔甲”，在不修改原有业务代码（比如下订单）的情况下，在业务执行前后自动加上“盔甲”的功能（比如记录日志、开启事务）。

### 8.1.2 Spring AOP术语

| 术语 | 英文 | 描述 |
| :--- | :--- | :--- |
| **切面** | **Aspect** | 关注点形成的类（重复代码封装成的类），通常包含横切逻辑（如事务管理、日志记录）。在 Spring 中通常通过 `<aop:aspect>` 或 `@Aspect` 定义。 |
| **连接点** | **Joinpoint** | 程序执行过程中某个特定的节点，如方法调用或异常处理。在 Spring AOP 中，连接点指的就是**被拦截到的方法**。 |
| **切入点** | **Pointcut** | 对连接点进行拦截的定义。当某个连接点满足预先指定的条件（切入点表达式）时，AOP 就会在该位置插入切面代码。**切入点是连接点的子集**。 |
| **通知/增强** | **Advice** | 拦截到连接点之后要执行的代码。即切面中的方法，是切面的具体实现（前置通知、后置通知等）。 |
| **目标对象** | **Target** | 被代理的对象，即包含主业务逻辑的类对象。 |
| **织入** | **Weaving** | 将切面代码插入到目标对象上，从而生成代理对象的过程。Spring AOP 在运行时完成织入。 |
| **代理** | **Proxy** | AOP 框架创建的对象，用于实现切面逻辑。它包含了目标对象和增强代码。 |
| **引介** | **Introduction** | 一种特殊的通知，允许在运行时为目标对象动态添加属性和方法。 |

## 8.2 Spring AOP的实现机制

Spring AOP 主要通过动态代理实现，有两种方式：**JDK动态代理** 和 **CGLib动态代理**。

### 8.2.1 JDK动态代理
*   **适用场景**：目标类**实现了接口**。
*   **实现原理**：通过 `java.lang.reflect.Proxy` 类和 `InvocationHandler` 接口实现。
*   **核心方法**：`Proxy.newProxyInstance(ClassLoader loader, Class<?>[] interfaces, InvocationHandler h)`。
    *   `loader`：类加载器。
    *   `interfaces`：目标对象实现的接口数组。
    *   `h`：调用处理程序（代理对象的方法调用会转发给 `invoke` 方法）。

### 8.2.2 CGLib动态代理
*   **适用场景**：目标类**没有实现接口**。
*   **实现原理**：采用底层的字节码技术（ASM），通过**继承**的方式动态创建目标类的子类作为代理对象。
*   **核心类**：`Enhancer` 和 `MethodInterceptor`。
*   **特点**：Spring 核心包已集成 CGLib，无需额外导入 JAR 包。

> **比较**：
> *   如果目标对象实现了接口，Spring 默认使用 JDK 动态代理。
> *   如果目标对象没有实现接口，Spring 使用 CGLib 动态代理。

## 8.3 基于XML的AOP实现

Spring 提供了 `aop` 命名空间用于配置 AOP。

### 配置元素

| 元素 | 描述 |
| :--- | :--- |
| `<aop:config>` | AOP 配置的根元素。 |
| `<aop:aspect>` | 配置切面，引用一个 Bean 作为切面。 |
| `<aop:pointcut>` | 配置切入点，定义拦截规则（表达式）。 |
| `<aop:before>` | 前置通知：在目标方法执行前执行。 |
| `<aop:after-returning>` | 返回通知：在目标方法成功执行后执行。 |
| `<aop:around>` | 环绕通知：在目标方法执行前后实施增强。 |
| `<aop:after-throwing>` | 异常通知：在目标方法抛出异常后执行。 |
| `<aop:after>` | 后置通知（最终通知）：无论是否发生异常，目标方法执行后都会执行（类似 `finally`）。 |

### 切入点表达式 (execution)
基本格式：
`execution(modifiers-pattern? ret-type-pattern declaring-type-pattern? name-pattern(param-pattern) throws-pattern?)`

常用示例：
`execution(* com.itheima.demo03.UserDaoImpl.*(..))`
*   `*`：匹配任意修饰符和返回值类型。
*   `com.itheima.demo03.UserDaoImpl`：目标类全路径。
*   `*`：匹配类中的任意方法。
*   `(..)`：匹配任意参数。

### 实现步骤
1.  **导入依赖**：`spring-aop`, `aspectjrt`, `aspectjweaver`。
2.  **编写目标类**：实现业务逻辑（如 `UserDaoImpl`）。
3.  **编写切面类**：定义增强方法（如 `check_Permissions`）。
4.  **配置 XML**：
    *   注册目标对象 Bean。
    *   注册切面 Bean。
    *   配置 `<aop:config>`：
        *   定义 `<aop:pointcut>`。
        *   定义 `<aop:aspect>`，引用切面 Bean，配置通知（如 `<aop:before>`）并关联切入点。

## 8.4 基于注解的AOP实现

Spring 提供了 `@AspectJ` 注解支持，使 AOP 开发更加简洁。

### 常用注解

| 注解 | 描述 |
| :--- | :--- |
| `@Aspect` | 标记一个类为切面类。 |
| `@Pointcut` | 定义切入点表达式。 |
| `@Before` | 前置通知。 |
| `@AfterReturning` | 返回通知。 |
| `@Around` | 环绕通知。 |
| `@AfterThrowing` | 异常通知。 |
| `@After` | 后置通知（最终通知）。 |

### 实现步骤
1.  **开启注解支持**：在 XML 配置中添加 `<aop:aspectj-autoproxy/>`。
2.  **编写切面类**：
    *   使用 `@Component` 将其注册为 Bean。
    *   使用 `@Aspect` 标记为切面。
    *   使用 `@Pointcut("execution(...)")` 定义切入点方法（通常为空方法）。
    *   在通知方法上使用 `@Before("切入点方法名()")` 等注解引用切入点。
3.  **编写目标类**：使用 `@Component` 等注解注册为 Bean。
4.  **测试**：从容器中获取目标 Bean，调用方法，验证增强效果。

**示例代码片段**：
```java
@Aspect
@Component
public class MyAspect {
    // 定义切入点
    @Pointcut("execution(* com.itheima.dao.*.*(..))")
    public void myPointCut(){}

    // 前置通知
    @Before("myPointCut()")
    public void before(){
        System.out.println("前置通知...");
    }
}
```