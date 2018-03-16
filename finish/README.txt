To use the sample application, extract the sampleapp_bulkhead.zip file to your local directory. 
The application contains two servlets, BankServiceServlet and BankServiceWithFallbackServlet, 
which call the Virtual Finance Advisor (VFA) service. 

Use the Maven command 'mvn install' from the directory containing the extracted .zip files to build 
the project and install it to your local repository.  This will create the 
'sampleapp_bulkhead/target/liberty' directory containing your liberty server, bulkheadSampleServer
and start the server.

The <extract-directory>\sampleapp_bulkhead\src directory contains the BankService.java and 
BankServiceWithFallback.java files as shown throughout this guide. These files are where the
@Bulkhead and @Asynchronous annotations injected into the code. For this sample app, the 
default values for these properties are value=5, waitingTaskQueue=5. This means that after 
5 concurrent chat requests to the VFA service is reached, the next 5 concurrent chat requests will be 
add to the waiting queue. When a chat request cannot be added to the waiting queue 
a message is display to indicate all the financial advisors are currently busy.   

The BankServiceWithFallback.java also contains @Fallback annotation. The ServiceFallbackHandler.java 
contains the fallback class identifies by @Fallback annotation. The fallback class is invoked when the 
maximum limit of concurrent requests has been reached and the wait queue is full. When the fallback is 
running, a message is display to allow a customer to schedule an appointment.

To start and stop the server, issue the following commands from 
<extract-directory>/sampleapp_bulkhead/target/liberty/wlp/bin:
      server start bulkheadSampleServer
      server stop bulkheadSampleServer

To access the sample application, visit the following URL from your browser:
      http://localhost:9080/bulkheadSample

This will show the following:

    Welcome to Virtual Financial Advisor Servlet

     Click here to request a financial advisor. 

     Click here to request a financial advisor with fallback.

To access the sample application with the VFA service, click on Click here to request a financial advisor.
To access the sample application with the VFA service with fallback, click on Click here to request a 
financial advisor with fallback.

Each click on Click here will open a separate chat window. To simulate the asynchronous requests, 
click on Click here multiple times to open concurrent chat requests.

Initially, after each chat browser session open, this will show "We are working to connect you with 
a financial advisor". Then the message "You are talking to advisor #" will display when the financial advisor
is available. Once the maximum concurrent chat requests is reached, the message "All financial advisors 
are currently busy. You are number # in the queue" will be display.

You can edit the java files to change the parameter values of the @Bulkhead annotation. If the 
bulkheadSampleServer is running, run the Maven command 'mvn package' from the directory that contains 
the extracted .zip file to rebuild the application and the changes will take effect without restarting the 
server. Otherwise, stop the bulkheadSampleServer as indicated, run the Maven command 'mvn install', and 
restart bulkheadSampleServer. 

To restart the application in order to simulate the chat requests again 
you can stop and restart the bulkheadSampleServer as indicated.




