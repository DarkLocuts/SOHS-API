#!/usr/bin/env bash

docker container stop sohs_api
docker container rm sohs_api
docker image rm sohs_api