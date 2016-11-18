---
layout: post
title: "Actors, Microservices & ChatOps - 3 dagar på Öredev"
date: 2016-11-18
---
I veckan som gick hade vi nöjet att besöka Öredev igen. En 3 dagars konferens i Malmö för utvecklare och agila freaks. Här följer ett par reflektioner från årets upplaga.

<!--more-->

## Microservices
Det var tydligt att microservices är på allas läppar just nu. Många va talarna som hade skickat in om att prata runt ämnet. Tyvärr var det få som lyckades tillföra något vettigt till diskussionen.

Klart är att många problem ofta kräver komplexa lösningar och att Microservices inte är en "gratis lunch".

## Actors, Evolved
En utav dom mer inspirerande föreläsningarna handlade om hur Microsoft Research tagit ett rejält omtag kring Actors och levererat något som iaf. ser lovande ut på ytan.

Orleans utlovar en enklare Actors modell där utvecklarna behöver bry sig mindre om hur och istället kan fokusera på vad. Att Actors går väl hand i hand med CQRS och Event Sourcing gör givetvis att vi håller ett extra öga på området.

## ChatOps - Ops för alla
Att få alla i teamet att känna sig hemma med att sätta upp, övervaka eller felsöka infrastruktur är inte nödvändigtvis lätt. Än svårare blir det när operations håller hårt i dom nycklar och credentials som krävs för att göra det.

Att integrera operations uppgifter direkt i din teamchat, som tex. Slack eller HipChat kan definitivt underlätta. En chatbot som kan fungera som ett delat "shell" som alla har tillgång till och som kan svara på frågan "hur mår våra ec2 instanser?" eller utföra kommandot "rensa gamla docker images från disk" är definitivt känns helt rätt. Inga fler "hemliga" script som bara 1 person kan använda!
