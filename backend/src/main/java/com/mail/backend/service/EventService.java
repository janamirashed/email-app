package com.mail.backend.service;

import com.mail.backend.model.SSE;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

@Service
public class EventService {
    //The Sink is the part allowing pushing data from code to the reactive stream (The flux)
    private final Sinks.Many<SSE> eventSink = Sinks.many().multicast().onBackpressureBuffer();

    //The flux is the Observable that clients subscribe to (including SSE)
    public Flux<SSE> getEventStream() {
        return eventSink.asFlux();
    }
    //the publisher that subscribers can publish event to
    public void publishEvent(SSE event) {
        Sinks.EmitResult result = eventSink.tryEmitNext(event);
        System.out.println("EmitResult " + event);
        if(result.isFailure()) {
            System.err.println("Error while publishing event: " + event);
        }
    }

}
