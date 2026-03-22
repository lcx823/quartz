---
share: true
title: 第9章 SpringBoot任务管理
created: 2026-03-22
source: Cherry Studio
tags:
---

# 第9章 SpringBoot任务管理

## 9.1 异步任务

**定理1**: Spring Boot通过`@EnableAsync`和`@Async`两个注解提供对异步任务的支持。`@EnableAsync`用于在配置类或主启动类上开启异步功能，而`@Async`用于标记一个方法为异步方法。当一个异步方法被调用时，Spring会从一个内部的线程池中获取一个线程来执行该方法，而调用者线程不会被阻塞，可以立即继续执行后续代码。

> 从初学者的角度来看，同步调用就像你去餐厅点餐，然后必须坐在那里一直等到菜做好端上来才能离开。而异步调用就像你点了外卖，下完单（调用方法）后你就可以直接回家干自己的事了（主流程继续执行），外卖小哥（异步线程）会负责把菜做好送过来，整个过程你无需在餐厅等待。

### 无返回值异步任务调用
**定理2**: 对于不需要返回结果的异步任务，方法的返回类型应为`void`。调用方发起调用后，不关心其执行结果，异步方法会在后台独立执行。

> 这就像你给朋友发一条“生日快乐”的短信。你把短信发出去（调用方法）就完事了，不会停下来等朋友回复“谢谢”才去做别的事情。

**例题1**: 模拟一个发送短信验证码的异步任务。
**解**:
**步骤1: 编写异步调用方法**
创建一个业务类`MyAsyncService`，在其中定义一个模拟耗时操作的`sendSMS`方法，并用`@Async`注解标记。
```java
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class MyAsyncService {
    @Async // 声明这是一个异步方法
    public void sendSMS() throws Exception {
        System.out.println("子线程开始 -> 调用短信验证码业务方法...");
        long startTime = System.currentTimeMillis();
        Thread.sleep(5000); // 模拟耗时5秒
        long endTime = System.currentTimeMillis();
        System.out.println("子线程结束 -> 短信业务执行完成耗时：" + (endTime - startTime) + "ms");
    }
}
```

**步骤2: 开启基于注解的异步任务支持**
在Spring Boot的主启动类上添加`@EnableAsync`注解。
```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync // 开启异步任务功能
@SpringBootApplication
public class Chapter09Application {
    public static void main(String[] args) {
        SpringApplication.run(Chapter09Application.class, args);
    }
}
```

**步骤3: 编写控制层业务调用方法**
在`Controller`中注入`MyAsyncService`并调用`sendSMS`方法。
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MyAsyncController {
    @Autowired
    private MyAsyncService myService;

    @GetMapping("/sendSMS")
    public String sendSMS() throws Exception {
        System.out.println("主线程开始 -> 发起短信发送请求...");
        long startTime = System.currentTimeMillis();
        myService.sendSMS(); // 调用异步方法，立即返回
        long endTime = System.currentTimeMillis();
        System.out.println("主线程结束 -> 主流程耗时：" + (endTime - startTime) + "ms");
        return "SMS request has been sent successfully!";
    }
}
```

**步骤4: 异步任务效果测试**
1. 启动项目，在浏览器访问`http://localhost:8080/sendSMS`。
2. 页面会几乎瞬间返回"SMS request has been sent successfully!"。
3. 观察控制台输出，会看到类似如下的日志（顺序可能略有不同，但时间戳能说明问题）：
```
    主线程开始 -> 发起短信发送请求...
    主线程结束 -> 主流程耗时：2ms
    子线程开始 -> 调用短信验证码业务方法...
    (等待约5秒后)
    子线程结束 -> 短信业务执行完成耗时：5000ms
    ```
    这证明了主流程没有等待5秒，而是立即完成了。

### 有返回值异步任务调用
**定理3**: 对于需要返回结果的异步任务，方法的返回类型必须是`Future<T>`或其子类（如`CompletableFuture<T>`）。Spring提供了一个简单的实现`AsyncResult<T>`。调用方会得到一个`Future`对象，可以通过调用其`get()`方法来获取最终结果，但`get()`方法是**阻塞**的，会一直等到异步任务执行完毕并返回结果为止。

> 这就像你点了外卖，但这次你需要外卖小票来报销。下单后你会拿到一个订单凭证（`Future`对象）。你可以先做别的事情，但当你需要报销时，你必须停下来，拿着凭证等待外卖小哥把餐和小票送来（调用`future.get()`并等待）。这种方式的优势在于，你可以同时点好几家外卖（调用多个异步方法），然后一起等待它们中送得最慢的那一个，总等待时间取决于最慢的那个，而不是所有时间的总和。

**例题2**: 模拟并行统计两个业务的数据，并汇总结果。
**解**:
**步骤1: 编写有返回值的异步调用方法**
在`MyAsyncService`中添加两个新的异步方法，返回`Future<Integer>`。
```java
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Service;
import java.util.concurrent.Future;

@Service
public class MyAsyncService {
 // ... sendSMS() 方法

 @Async
 public Future<Integer> processA() throws Exception {
 System.out.println("子线程A开始 -> 分析并统计业务A数据...");
 Thread.sleep(4000); // 模拟耗时4秒
 int count = 123456;
 System.out.println("子线程A结束 -> 业务A数据统计完成。");
 return new AsyncResult<>(count);
 }

 @Async
 public Future<Integer> processB() throws Exception {
 System.out.println("子线程B开始 -> 分析并统计业务B数据...");
 Thread.sleep(5000); // 模拟耗时5秒
 int count = 654321;
 System.out.println("子线程B结束 -> 业务B数据统计完成。");
 return new AsyncResult<>(count);
 }
}
```

**步骤2: 编写控制层业务调用方法**
在`Controller`中调用这两个方法，并使用`Future.get()`获取结果进行汇总。
```java
@GetMapping("/statistics")
public String statistics() throws Exception {
 System.out.println("主线程开始 -> 发起数据统计任务...");
 long startTime = System.currentTimeMillis();

 // 1. 同时触发两个异步任务
 Future<Integer> futureA = myService.processA();
 Future<Integer> futureB = myService.processB();

 // 2. 在需要结果时，调用get()方法阻塞等待
 int total = futureA.get() + futureB.get();

 long endTime = System.currentTimeMillis();
 System.out.println("异步任务数据统计汇总结果：" + total);
 System.out.println("主线程结束 -> 主流程耗时：" + (endTime - startTime) + "ms");
 return "Total statistics: " + total;
}
```

**步骤3: 异步任务效果测试**
1.  启动项目，在浏览器访问`http://localhost:8080/statistics`。
2.  页面会等待大约5秒后返回结果。
3.  观察控制台输出，会发现主流程的耗时约等于两个异步任务中耗时较长的那个（5秒），而不是两个任务耗时之和（4+5=9秒）。
    ```
    主线程开始 -> 发起数据统计任务...
    子线程A开始 -> 分析并统计业务A数据...
    子线程B开始 -> 分析并统计业务B数据...
    (等待约4秒后)
    子线程A结束 -> 业务A数据统计完成。
    (等待约1秒后)
    子线程B结束 -> 业务B数据统计完成。
    异步任务数据统计汇总结果：777777
    主线程结束 -> 主流程耗时：5008ms
    ```
    这证明了两个任务是并行执行的。

## 9.2 定时任务

**定理4**: Spring Boot通过`@EnableScheduling`和`@Scheduled`两个注解提供对定时任务的支持。`@EnableScheduling`用于开启定时任务功能，`@Scheduled`标记一个方法为定时任务，并可以通过`cron`、`fixedRate`、`fixedDelay`等属性来定义执行规则。

> 这就像给你手机设置闹钟。`@EnableScheduling`是打开手机的闹钟总开关。`@Scheduled`就是设置一个具体的闹钟，你可以设置它在“每天早上8点”响（`cron`），或者“每隔5分钟”响一次（`fixedRate`），或者“在你按下贪睡键5分钟后”再响（`fixedDelay`）。

**`@Scheduled`注解的关键属性**:
| 属性 | 描述 |
| :--- | :--- |
| `cron` | 使用Cron表达式定义复杂的执行时间规则。例如 `"0 0 2 * * ?"` 表示每天凌晨2点执行。 |
| `fixedRate` | 固定频率执行。以上一次任务**开始**时间为基准，等待指定毫秒数后执行下一次任务。如果任务执行时间超过间隔，任务结束后会立即执行下一次。|
| `fixedDelay`| 固定延迟执行。以上一次任务**结束**时间为基准，等待指定毫秒数后执行下一次任务。 |

**例题3**: 实现一个定时打印当前时间的任务。
**解**:
**步骤1: 编写定时任务业务处理方法**
创建一个`ScheduledTaskService`类，并在其中定义定时任务方法。
```java
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class ScheduledTaskService {

 // cron表达式：每5秒执行一次
 @Scheduled(cron = "0/5 * * * * ?")
 public void scheduledTaskWithCron() {
 System.out.println("Cron Task :: Executed at " + LocalDateTime.now());
 }

 // fixedRate：每隔6秒执行一次
 @Scheduled(fixedRate = 6000)
 public void scheduledTaskWithFixedRate() {
 System.out.println("Fixed Rate Task :: Executed at " + LocalDateTime.now());
 }

 // fixedDelay：上一次执行完毕后，延迟7秒再执行
 @Scheduled(fixedDelay = 7000)
 public void scheduledTaskWithFixedDelay() {
 System.out.println("Fixed Delay Task :: Executed at " + LocalDateTime.now());
 }
}
```

**步骤2: 开启基于注解的定时任务支持**
在主启动类上添加`@EnableScheduling`注解。
```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling // 开启定时任务功能
@SpringBootApplication
public class Chapter09Application {
 // ...
}
```

**步骤3: 定时任务效果测试**
1.  启动项目。
2.  观察控制台输出，会看到三个任务按照各自的规则周期性地打印日志。可以清晰地看到`fixedRate`和`fixedDelay`在执行时机上的区别。

## 9.3 邮件任务

**定理5**: Spring Boot通过`spring-boot-starter-mail`提供了强大的邮件发送功能。只需添加依赖并在`application.properties`中配置好SMTP服务器信息，即可注入`JavaMailSender`接口来发送邮件。

> 这相当于Spring Boot为你提供了一整套邮政服务。你只需要在`pom.xml`里“购买邮票”（添加依赖），在配置文件里“写下邮局地址”（配置SMTP），然后就可以把信交给“邮递员”(`JavaMailSender`)去发送了。

### 发送纯文本邮件
**例题4**: 使用QQ邮箱发送一封简单的纯文本邮件。
**解**:
**步骤1: 添加邮件服务依赖**
在`pom.xml`中添加：
```xml
<dependency>
 <groupId>org.springframework.boot</groupId>
 <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

**步骤2: 添加邮件服务配置**
在`application.properties`中配置，以QQ邮箱为例：
```properties
# 发件人邮箱的SMTP服务器地址
spring.mail.host=smtp.qq.com
spring.mail.port=587
# 发件人邮箱账号
spring.mail.username=your-email@qq.com
# 授权码（注意：不是邮箱密码，需要在邮箱设置中生成）
spring.mail.password=your-authorization-code
spring.mail.default-encoding=UTF-8

# 其他可选配置
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
```

**步骤3: 定制邮件发送服务**
创建一个`SendEmailService`并编写发送方法。
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class SendEmailService {
 @Autowired
 private JavaMailSender mailSender;

 @Value("${spring.mail.username}")
 private String from;

 public void sendSimpleEmail(String to, String subject, String content) {
 SimpleMailMessage message = new SimpleMailMessage();
 message.setFrom(from);
 message.setTo(to);
 message.setSubject(subject);
 message.setText(content);
 mailSender.send(message);
 }
}
```

**步骤4: 纯文本邮件发送效果测试**
在测试类中调用该服务。
```java
@Autowired
private SendEmailService sendEmailService;

@Test
public void sendSimpleMailTest() {
 sendEmailService.sendSimpleEmail("recipient-email@example.com",
 "Test Simple Email",
 "Hello, this is a simple test email from Spring Boot.");
 System.out.println("Email sent successfully.");
}
```
运行测试后，收件人邮箱会收到一封纯文本邮件。

### 发送带附件和图片的邮件
**定理6**: 对于复杂的邮件（HTML内容、附件、内联图片等），需要使用`MimeMessage`和`MimeMessageHelper`来构建。

> 这就像寄一个包裹。你需要一个箱子(`MimeMessage`)和一位打包助手(`MimeMessageHelper`)。助手可以帮你把信件（HTML内容）、照片（内联图片）和文件（附件）都整齐地放进箱子里。

**例题5**: 发送一封包含HTML内容、一张内联图片和一个附件的邮件。
**解**:
**步骤1: 定制邮件发送服务**
在`SendEmailService`中添加新方法。
```java
import org.springframework.mail.javamail.MimeMessageHelper;
import javax.mail.internet.MimeMessage;
import org.springframework.core.io.FileSystemResource;
import java.io.File;

// ...
public void sendComplexEmail(String to, String subject, String content,
 String rscId, String rscPath, String attachmentPath) throws Exception {
 MimeMessage message = mailSender.createMimeMessage();
 // 使用MimeMessageHelper，第二个参数true表示构建一个multipart message
 MimeMessageHelper helper = new MimeMessageHelper(message, true);

 helper.setFrom(from);
 helper.setTo(to);
 helper.setSubject(subject);

 // 第二个参数true表示邮件内容为HTML
 helper.setText(content, true);

 // 添加内联图片
 FileSystemResource res = new FileSystemResource(new File(rscPath));
 helper.addInline(rscId, res);

 // 添加附件
 FileSystemResource file = new FileSystemResource(new File(attachmentPath));
 helper.addAttachment(file.getFilename(), file);

 mailSender.send(message);
}
```

**步骤2: 邮件发送效果测试**
在测试类中调用。
```java
@Test
public void sendComplexMailTest() throws Exception {
 String content = "<html><body><h3>Hello!</h3><p>This is an email with an inline image:</p>" +
 "<img src='cid:cat01' /></body></html>";
 String rscId = "cat01";
 String rscPath = "C:\\path\\to\\your\\image.jpg"; // 图片路径
 String attachmentPath = "C:\\path\\to\\your\\attachment.txt"; // 附件路径

 sendEmailService.sendComplexEmail("recipient-email@example.com",
 "Test Complex Email",
 content, rscId, rscPath, attachmentPath);
 System.out.println("Complex email sent successfully.");
}
```
收件人将收到一封带有图片和附件的HTML邮件。

### 发送模板邮件
**定理7**: 结合`spring-boot-starter-thymeleaf`模板引擎，可以动态生成邮件内容，实现个性化邮件发送。

> 这就像是邮件合并。你有一个邮件模板（Thymeleaf HTML文件），里面有占位符（如`${username}`）。`TemplateEngine`会像一个自动填表机器，把真实数据填入模板，为每个收件人生成一封独一无二的邮件。

**例题6**: 使用Thymeleaf模板发送一封包含动态验证码的邮件。
**解**:
**步骤1: 添加Thymeleaf依赖**
在`pom.xml`中添加：
```xml
<dependency>
 <groupId>org.springframework.boot</groupId>
 <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

**步骤2: 定制模板邮件**
在`resources/templates/`目录下创建一个`email-template.html`文件。
```html
<!DOCTYPE html>
<html lang="zh" xmlns:th="http://www.thymeleaf.org">
<body>
 <div>尊敬的 <span th:text="${username}">XXX</span>, 您好：</div>
 <p>您的验证码为 <strong style="color: blue;" th:text="${code}">123456</strong>，请妥善保管。</p>
</body>
</html>
```

**步骤3: 定制邮件发送服务**
注入`TemplateEngine`并使用它来处理模板。
```java
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class SendEmailService {
 // ... 其他属性和方法
 @Autowired
 private TemplateEngine templateEngine;

 public void sendTemplateEmail(String to, String subject, String username, String code) throws Exception {
 // 创建Thymeleaf上下文对象
 Context context = new Context();
 context.setVariable("username", username);
 context.setVariable("code", code);

 // 使用模板引擎处理模板，生成最终的HTML内容
 String emailContent = templateEngine.process("email-template", context);

 // 使用MimeMessageHelper发送HTML邮件
 MimeMessage message = mailSender.createMimeMessage();
 MimeMessageHelper helper = new MimeMessageHelper(message, true);
 helper.setFrom(from);
 helper.setTo(to);
 helper.setSubject(subject);
 helper.setText(emailContent, true);

 mailSender.send(message);
 }
}
```

**步骤4: 模板邮件发送效果测试**
```java
@Test
public void sendTemplateMailTest() throws Exception {
 sendEmailService.sendTemplateEmail("recipient-email@example.com",
 "Your Verification Code",
 "张三", "888666");
 System.out.println("Template email sent successfully.");
}
```
收件人将收到一封内容为“尊敬的 张三, 您好：您的验证码为 888666，请妥善保管。”的邮件。
