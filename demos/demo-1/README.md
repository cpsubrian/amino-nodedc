Demo 1
======

Simple http amino service.

How to run
----------

Install amino-gateway globally

```
$ npm install amino-gateway -g
```

Start up a gateway ('humblr' service, port 8081, 1 thread)

```
$ amino-gateway -s humblr -p 8081 -t 1
```

Start up a couple humblr services (each in their own terminal)

```
$ node humblr.js
```

Now, curl to the gateway and watch it pass requests off to services.

```
$ curl localhost:8081
```

Play around with the gateway and servies.  Add new services. Kill services. Kill
all the services. Kill the gateway.  Etc.