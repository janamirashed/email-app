package com.mail.backend.controller;

import com.mail.backend.model.SSE;
import com.mail.backend.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.util.stream.Stream;

@RestController
public class EventController {


@Autowired
private EventService eventService;
//The SSE endpoint that subscribes to our eventService
@GetMapping(path = "/event-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<ServerSentEvent<SSE>> streamUpdates(Authentication authentication) {
    String username = authentication.getName();
    return eventService.getEventStream()
            .map(event -> ServerSentEvent
                    .<SSE>builder()
                    .data((event.getTo().contains(username+"@jaryn.com"))?event:null)
                    .build());
}
}
