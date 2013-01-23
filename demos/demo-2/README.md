Demo 2
======

Deploy an amino service with amino-drone and amino-deploy.

How to run
----------

Install amino-drone globally
```
$ npm install amino-drone -g
```

Install amino-deploy globally
```
$ npm install amino-drone -g
```

Start up two or three drones.

```
$ cd /tmp
$ mkdir drones
$ cd drones
$ mkdir drone-1
$ mkdir drone-2
$ mkdir drone-3
$ cd drone-1
$ amino-drone -s humblr-drone

Repeat last two steps for each drone (in their own terminals).
```

Navigate to the demo-2 directory. Setup config (to persist common settings).

```
$ amino config -s humblr-drone
```

Deploy the code.

```
$ amino deploy --threads=1 -- node humblr.js
```

View the running processes.

```
$ amino ps
```

Start up a gateway.

```
$ amino-gateway -s humblr -p 8082 -t 1
```

Curl to the humblr service to confirm the deploy worked.

```
$ curl localhost:8082
```

Try out some of the other commands:

```
$ amino --help
$ amino respawn
$ amino redeploy
$ amino stop
```
