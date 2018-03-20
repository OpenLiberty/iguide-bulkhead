To use the sample application, extract the sampleapp_bulkhead.zip file to your local directory.
The application contains servlet BankServiceServlet which calls the VirtualFinancialAdvisor 
(VFA) service. 

Use the 'mvn install' Maven command from the directory that contains the extracted .zip files 
to build the project and install it in your local repository. The command creates the 
'target/liberty' directory that contains your Liberty server, bulkheadSampleServer, and starts 
the server.

To start and stop the server, issue the following commands from the
<extract-directory> directory:
      mvn liberty:start-server
      mvn liberty:stop-server

To access the sample application, visit the following URL from your browser:
      http://localhost:9080/bulkheadSample/vfa

To simulate making multiple asynchronous requests to the VirtualFinancialAdvisor service, open 
the browser with the above link then click on the refresh button multiple times. 

Initially, after each chat session opens, the browser displays the following message:  
      "We are working to connect you with a financial advisor." 

The message changes after 20 seconds simulating the delay until a financial advisor is available:
      "You are talking to advisor <number>."
 
When the maximum limit of concurrent chat requests is reached, the following message is displayed:
      "All financial advisors are currently busy. You are <number> in the queue."

If the waiting queue becomes full within 20 seconds of simulating concurrent requests, the  
fallback method runs and displays the panel that asks the user to schedule an appointment to chat
with a financial advisor.

The <extract-directory>/src directory contains the BankService.java and 
ServiceFallbackHandler.java files as shown throughout this guide. The @Bulkhead and 
@Asynchronous annotations that are injected into the code are located in BankService.java. For 
this sample app, the values for the bulkhead parameters are set to their default values which 
are value=5 and waitingTaskQueue=5. These values indicate that after 5 concurrent chat requests 
reach the VFA service, the next 5 concurrent chat requests are added to the waiting queue.

The BankService.java file also contains the @Fallback annotation. The 
ServiceFallbackHandler.java file contains the fallback class that is identified by the 
@Fallback annotation. The fallback class runs when the maximum limit of concurrent 
requests is reached and the waiting queue is full. When the fallback runs, a message displays 
that allows a customer to schedule an appointment.

The BankService.java file also contains the delay TIMEOUT value that defaults to 20 seconds. The 
delay is necessary to simulate concurrent requests. Otherwise, the service returns too quickly. 
If you are unable to make enough requests to fill up the waiting queue within this specified delay 
time so that you can see the fallback method run, try increasing this value. 

You can edit the Java files to change the parameter values of the @Bulkhead annotation and the 
delay TIMEOUT value. If the bulkheadSampleServer server is running, run the 'mvn package' Maven 
command from the directory that contains the extracted .zip file to rebuild the application. The 
changes take effect without restarting the server. Otherwise, stop the bulkheadSampleServer server 
as indicated, run the 'mvn install' Maven command which will restart the server. 

To restart the application to simulate the chat requests again, you can stop and restart the 
bulkheadSampleServer server as indicated.







