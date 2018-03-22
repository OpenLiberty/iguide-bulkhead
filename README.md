# iguide-bulkhead

Link to the guide on Openliberty.io: https://openliberty.io/guides/bulkhead.html

This repo provides an interactive guide on the Openliberty.io website that users can interact with
and learn more about different concepts related to Open Liberty.

## What you'll learn:

Explore how the MicroProfile Bulkhead policy from the Fault Tolerance feature limits requests and
prevents faults from stopping an entire system.

You will learn about the limitations of single-threaded programs by looking at a simple online 
banking microservice. You'll then implement concurrency to scale your microservice and see how 
it fails when no fault tolerance is implemented. Next, you'll enable the MicroProfile Fault 
Tolerance feature and use the Bulkhead policy to prevent the failing method from taking down 
the whole application. You'll explore the two approaches to Bulkhead, semaphore isolation and 
thread pool isolation, and the parameters used for the annotation. Finally, you'll add a fallback 
class, which is invoked if a BulkheadException is thrown.
