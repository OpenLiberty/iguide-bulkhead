To use the sample application, extract the sampleapp_bulkhead.zip file to your local directory. 
The application contains two servlets, BankServiceServlet and BankServiceWithFallbackServlet, 
which call the VirtualFinancialAdvisor (VFA) service. 

Use the 'mvn install' Maven command from the directory that contains the extracted .zip files 
to build the project and install it in your local repository. The command creates the 
'<extract-directory>/target/liberty' directory that contains your Liberty server, 
bulkheadSampleServer, and starts the server.

To start and stop the server, issue the following commands from the
<extract-directory>/ directory:
      mvn liberty:start-server
      mvn liberty:stop-server

The <extract-directory>/src directory contains the BankService.java and 
ServiceFallbackHandler.java files as shown throughout this guide. The @Bulkhead and 
@Asynchronous annotations that are injected into the code are located in these files. For this 
sample app, the values for the bulkhead parameters are set to their default values which are 
value=5 and waitingTaskQueue=5. These values indicate that after 5 concurrent chat requests reach 
the VFA service, the next 5 concurrent chat requests are added to the waiting queue.

The BankServiceWithFallback.java file also contains the @Fallback annotation. The 
ServiceFallbackHandler.java file contains the fallback class that is identified by the 
@Fallback annotation. The fallback class is invoked when the maximum limit of concurrent 
requests is reached and the wait queue is full. When the fallback runs, a message displays 
to allow a customer to schedule an appointment.

To access the sample application, visit the following URL from your browser:
      http://localhost:9080/bulkheadSample/vfa

This URL shows the following message:

      "We are working to connect you with a financial advisor."

To simulate the asynchronous requests, open multiple tabs with the above link or click on 
refresh button multiple times.

Initially, after each chat browser session opens, the browser displays a message that states, 
"We are working to connect you with a financial advisor." Next, the message that states, 
"You are talking to advisor <number>," is displayed when the financial advisor is available. 
When the maximum limit of concurrent chat requests is reached, the message, "All financial 
advisors are currently busy. You are <number> in the queue," is displayed.

You can edit the Java files to change the parameter values of the @Bulkhead annotation. If the 
bulkheadSampleServer server is running, run the 'mvn package' Maven command from the directory 
that contains the extracted .zip file to rebuild the application. The changes take effect 
without restarting the server. Otherwise, stop the bulkheadSampleServer server as indicated, 
run the 'mvn install' Maven command. 

To restart the application to simulate the chat requests again, you can stop and restart the 
bulkheadSampleServer server as indicated.




