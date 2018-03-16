To use the sample application, extract the sampleapp_bulkhead.zip file to your local directory. 
The application contains two servlets, BankServiceServlet and BankServiceWithFallbackServlet, 
which call the Virtual Finance Advisor (VFA) service. 

Use the 'mvn install' Maven command from the directory that contains the extracted .zip files to build 
the project and install it in your local repository. The command creates the 
'sampleapp_bulkhead/target/liberty' directory that contains your bulkheadSampleServer Liberty server
and starts the server.

The <extract-directory>\sampleapp_bulkhead\src directory contains the BankService.java and 
BankServiceWithFallback.java files as shown throughout this guide. The
@Bulkhead and @Asynchronous annotations that are injected into the code are located in these files. For this sample app,
value=5, waitingTaskQueue=5 are the default values for these properties. These values indicate that after 
5 concurrent chat requests reach the VFA service, the next 5 concurrent chat requests are 
added to the waiting queue. When a chat request cannot be added to the waiting queue, 
a message is displayed to indicate that all the financial advisors are currently busy.   

The BankServiceWithFallback.java file also contains the @Fallback annotation. The ServiceFallbackHandler.java file
contains the fallback class that is identified by the @Fallback annotation. The fallback class is invoked when the 
maximum limit of concurrent requests is reached and the wait queue is full. When the fallback 
runs, a message displays to allow a customer to schedule an appointment.

To start and stop the server, issue the following commands from the
<extract-directory>/sampleapp_bulkhead/target/liberty/wlp/bin directory:
      server start bulkheadSampleServer
      server stop bulkheadSampleServer

To access the sample application, visit the following URL from your browser:
      http://localhost:9080/bulkheadSample

This URL shows the following message:

    Welcome to Virtual Financial Advisor Servlet

     Click here to request a financial advisor. 

     Click here to request a financial advisor with fallback.

To access the sample application with the VFA service, click the 'Click here to request a financial advisor' button.
To access the sample application with the VFA service with fallback, click the 'Click here to request a 
financial advisor with fallback' button.

Each click on the 'Click here' button opens a separate chat window. To simulate the asynchronous requests, 
click the 'Click here' button multiple times to open concurrent chat requests.

Initially, after each chat browser session opens, the browser displays a message that states, "We are working to connect you with 
a financial advisor." Next, the message that states, "You are talking to advisor <number>," displays when the financial advisor
is available. When the maximum concurrent chat requests is reached, the message, "All financial advisors 
are currently busy. You are <number> in the queue," displays.

You can edit the Java files to change the parameter values of the @Bulkhead annotation. If the 
bulkheadSampleServer server is running, run the 'mvn package' Maven command from the directory that contains 
the extracted .zip file to rebuild the application. The changes take effect without restarting the 
server. Otherwise, stop the bulkheadSampleServer server as indicated, run the 'mvn install' Maven command, and 
restart the bulkheadSampleServer server. 

To restart the application to simulate the chat requests again, 
you can stop and restart the bulkheadSampleServer server as indicated.




