/*******************************************************************************
 * Copyright (c) 2018 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
package io.openliberty.guides.bulkhead.global.eBank.microservices.rest;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import java.util.concurrent.Future;

import io.openliberty.guides.bulkhead.global.eBank.microservices.Service;
import io.openliberty.guides.bulkhead.global.eBank.microservices.Utils;
import io.openliberty.guides.bulkhead.global.eBank.microservices.BankService;
import org.eclipse.microprofile.faulttolerance.exceptions.BulkheadException;


@Path("vfa")
public class Producer {

    private static int waitQueue = 0;
    private static int requests = 0; 

    @Inject
    BankService bankService;

    @GET
    @Produces(MediaType.TEXT_HTML)
    public String getVFA() {
        int value = bankService.bulkheadValue;
        int waitingTaskQueue = bankService.bulkheadWaitingQueue;

        String returnMsg = "";        
            
        try {
            Future<Service> future = bankService.requestForVFA();
            requests++;
            
            if (requests > value) {
                waitQueue++;                
            }
        
            if (requests > value &&
                waitQueue <= waitingTaskQueue) {
                //There are no financial advisors available. You are number # in the queue
                returnMsg = Utils.getHTMLForWaitingQueue(waitQueue);
                return returnMsg;
            }
                
            // You are talking to advisor #
            Service service = future.get();
            returnMsg = service.toString();
           
            // after chat service is done
            if (waitQueue > 0) {
                waitQueue--;
            }
        } catch (Exception e) {
            returnMsg = e.getMessage();
        } 
        return returnMsg;
    }
    
}