package com.mail.backend.config.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Date;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class ThrottleRequestsFilter extends OncePerRequestFilter {

    long MAX_REQUEST_COUNT = 200;
    long REFRESH_TIME_MILLIS = (long) (60 * 1e3);
    ConcurrentHashMap<String, RemoteRequestData> requests;

    public ThrottleRequestsFilter() {
        requests = new ConcurrentHashMap<>();
    }


    public String getClientIpAddress(HttpServletRequest request) {

        //Check the X-Forwarded-For header for services like AWS, Cloudflare or ngrok
        String ipAddress = request.getHeader("X-FORWARDED-FOR");

        if (ipAddress != null && !ipAddress.isEmpty() && !"unknown".equalsIgnoreCase(ipAddress)) {
            // The X-Forwarded-For header can be a list of IPs first of which is the original Client:
            // Client-IP, Proxy-1-IP, Proxy-2-IP
            return ipAddress.split(",")[0].trim();
        }

        // 2. Fallback to the direct connection IP address if it wasn't forwarded
        return request.getRemoteAddr();
    }


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String ipAddr = getClientIpAddress(request);
        if(!requests.containsKey(ipAddr)){
            requests.put(ipAddr, new RemoteRequestData(new Date()));
            System.out.println(requests.size());
            //no need to do another check it's the first request from this IP
            filterChain.doFilter(request,response);
            System.out.println("connection from new IP " + ipAddr);
            return;
        }

        RemoteRequestData data = requests.get(ipAddr);
        synchronized (data){
            if (new Date().getTime() - data.firstRequestTime.getTime() > REFRESH_TIME_MILLIS){
                data.requestCount.set(1);
                data.firstRequestTime = new Date();
                System.out.println("Resetting time for IP :" + ipAddr);
            }

            int count = data.requestCount.incrementAndGet();

            if (count > MAX_REQUEST_COUNT){
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                System.out.println("Blocking request from IP :" + ipAddr);
                return; //to not pass it down the chain
            }
        }
        filterChain.doFilter(request,response);
    }

    static class RemoteRequestData {
        AtomicInteger requestCount;
        Date firstRequestTime;
        protected RemoteRequestData(Date firstRequestTime) {
            this.requestCount = new AtomicInteger(1);
            this.firstRequestTime = firstRequestTime;
        }
    }
}
