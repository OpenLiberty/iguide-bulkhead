To use the sample application, extract the sampleapp_bulkhead.zip file to your local directory. The application contains a Virtual Finance Advisor (VFA) service.  

Use the Maven command 'mvn install' from the directory containing the extracted .zip files to build the project and install it to your local repository.  This will create the 
'sampleapp_bulkhead/target/liberty' directory containing your liberty server, bulkheadSampleServer and start the server.

The <extract-directory>\sampleapp_bulkhead\src directory contains the BankService.java and BankServiceWithFallback.java files as shown throughout this guide. These files are where the @Bulkhead and @Asynchronous annotations 
injected into the code. For this sample app, the default values for these properties are value=5, waitingTaskQueue=5. The BankServiceWithFallback.java also contains @Fallback annotation.

To start and stop the server, issue the following commands from 
<extract-directory>/sampleapp_bulkhead/target/liberty/wlp/bin:
      server start bulkheadSampleServer
      server stop bulkheadSampleServer

To execute the sample application with vfa service, visit the following URL from your browser:
      http://localhost:9080/bulkheadSample/vfa
Initially this will show "We are working to connect you with a financial advisor.". Then the message "You are talking to advisor #1" will display. To simulate the request, click on refresh button in the browser.

To execute the sample application with vfa service with Fallback, visit the following URL from your browser:
      http://localhost:9080/bulkheadSample/vfafb
Initially this will show "We are working to connect you with a financial advisor.". Then the message "You are talking to advisor #1" will display. To simulate the request, click on refresh button in the browser.

You can edit the java file to change the properties values of the @Bulkhead annotation. The changes will only take effect at application startup. 

If the bulkheadSampleServer is running, run the Maven command 'mvn package' to rebuild the application and the changes will take effect without restarting the server.

Restarting the bulkheadSampleServer as indicate above will restart the application.

