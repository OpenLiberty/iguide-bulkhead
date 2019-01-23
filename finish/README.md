# Setup

To use the sample application, extract the [sampleapp_bulkhead.zip] (https://github.com/OpenLiberty/iguide-bulkhead/raw/master/finish/sampleapp_bulkhead.zip) file to your local directory.

Use the 'mvn install' Maven command from the directory that contains the extracted .zip files to build the project and install it in your local repository. The command creates the `target/liberty` directory that contains your Liberty server, bulkheadSampleServer, and starts the server in the background.

To stop the running server, run the Maven command `mvn liberty:stop-server` from the <extract-directory> directory. To start the bulkheadSampleServer, run the Maven command `mvn liberty:start-server` in the <extract-directory> directory.

To access the sample application, visit the following URL from your browser:
      http://localhost:9080/bulkheadSample/virtualFinancialAdvisor

The sample application sets the maximum number of concurrency requests and the size of the waiting queue to 2. To simulate making multiple asynchronous requests to the virtualFinancialAdvisor service with these values, open a browser with at least 5 tabs. In each tab quickly enter the URL http://localhost:9080/bulkheadSample/virtualFinancialAdvisor. The first 2 requests will be serviced, the 3rd and 4th requests will be put on the waiting queue, and the final 5th request will be shown the output of the fallback handler.

Initially, after each chat session opens, the browser displays the following message:  
      "We are working to connect you with a financial advisor." 

The message changes after 30+ seconds simulating the delay until a financial advisor is available:
      "You are talking to advisor <number>."
 
The initial value for the maximum number of concurrent requests to the chat service is 2. After reaching the maximum limit of concurrent chat requests, the next request displays the following message:
      "There are no financial advisors available. You are number <number> in the queue."

The initial size of the waiting queue in the sample application is 2. When the waiting queue becomes full, the next request triggers the fallback method and displays the panel that asks the user to schedule an appointment to chat with a financial advisor.

The chat session is coded to last for a minute.  After a minute has passed you will see the message:
      "Chat has ended."
Afterwards, the next request on the waiting queue will connect to a financial advisor.      

Edit the Java files to change the parameter values of the `@Bulkhead` annotation. If the bulkheadSampleServer server is running, run the `mvn package` Maven command from the directory that contains the extracted .zip file to rebuild the application. The changes take effect without restarting the server. Otherwise, run the `mvn install` Maven command which will start the server.

To restart the application to simulate the chat requests again, you can stop and restart the 
bulkheadSampleServer server as indicated.

To view the console log, run the following or other alternative way to view the file:

    tail -f <extract-directory>/target/liberty/wlp/usr/servers/bulkheadSampleServer/logs/console.log

# Configuration

The <extract-directory>/src directory contains the BankService.java and ServiceFallbackHandler.java files as shown throughout this guide. 

## BankService.java
The `@Bulkhead` and `@Asynchronous` annotations that are injected into the code are located in BankService.java. 

### @Bulkhead Parameters
The `@Bulkhead` annotation has parameters to configure its usage.
* **value** specifies the maximum number of concurrent requests to the service. If the parameter is not specified, the default is `10` requests.
* **waitingTaskQueue** specifies the size of the waiting queue that holds requests to run at a different time. This parameter must be greater than `0`. If the parameter is not specified, the default is `10` requests. This parameter for the `@Bulkhead` annotation takes effect only when you use the `@Asynchronous` annotation.

In this sample application, the values for the bulkhead parameters are initially set to **value**=2 and **waitingTaskQueue**=2. These values indicate that after 2 concurrent chat requests reach the virtualFinancialAdvisor service, the next 2 concurrent chat requests are added to the waiting queue.

The BankService.java file also contains the `@Fallback` annotation. The ServiceFallbackHandler.java file contains the fallback class that is identified by the `@Fallback` annotation. The fallback class runs when the maximum limit of concurrent requests is reached and the waiting queue is full. When the fallback runs, a message displays that allows a customer to schedule an appointment.

The BankService.java file also contains the delay TIMEOUT value that defaults to 30 seconds (30000 milliseconds). The delay is necessary to simulate concurrent requests in multiple tabs of the browser and allow you to fill up the waiting queue. Otherwise, we found that the service returns too quickly. If you are unable to make enough requests to fill up the waiting queue within this specified delay time so that you can see the fallback method run, try increasing this value. 

The application contains servlet BankServiceServlet which calls the virtualFinancialAdvisor service.