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
package io.openliberty.guides.bulkhead.global.eBank.microservices;

import org.eclipse.microprofile.faulttolerance.ExecutionContext;
import org.eclipse.microprofile.faulttolerance.FallbackHandler;

import java.util.concurrent.Future;
import java.util.concurrent.CompletableFuture;


public class ServiceFallbackHandler implements FallbackHandler<Future<Service>> {

    @Override
    public Future<Service> handle(ExecutionContext context) {
        return handleFallback(context);
    }

    private Future<Service> handleFallback(ExecutionContext context) {
        Service myChat = new Service();
        return CompletableFuture.completedFuture(myChat);
    }
} 