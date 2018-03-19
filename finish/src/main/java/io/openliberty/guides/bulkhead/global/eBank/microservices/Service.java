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

import io.openliberty.guides.bulkhead.global.eBank.microservices.Utils;


public class Service {

    private String service = "";

    public Service(int counterForVFA) {
        int localCounter = Utils.calculateAdvisorNum(counterForVFA);
        try {
            this.service = Utils.getHTMLForChatWithVFA(localCounter);  
            Thread.sleep(30000);
        } catch (InterruptedException ie) {
            System.out.println("InterruptedException " + ie.getMessage());
        } 
    }

    public Service() {     
        this.service = Utils.getHTMLForScheduleAppt(); 
    }

    public String toString() {
        return this.service;
    }

}