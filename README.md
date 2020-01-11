![Logo](admin/freeathome.png)
# ioBroker.freeathome

<!-- [![NPM version](http://img.shields.io/npm/v/iobroker.freeathome.svg)](https://www.npmjs.com/package/iobroker.freeathome) -->
<!-- [![Downloads](https://img.shields.io/npm/dm/iobroker.freeathome.svg)](https://www.npmjs.com/package/iobroker.freeathome) -->
<!-- ![Number of Installations (latest)](http://iobroker.live/badges/freeathome-installed.svg) -->
<!-- ![Number of Installations (stable)](http://iobroker.live/badges/freeathome-stable.svg) -->
[![Dependency Status](https://img.shields.io/david/mobilutz/iobroker.freeathome.svg)](https://david-dm.org/mobilutz/iobroker.freeathome)
[![Known Vulnerabilities](https://snyk.io/test/github/mobilutz/ioBroker.freeathome/badge.svg)](https://snyk.io/test/github/mobilutz/ioBroker.freeathome)

<!-- [![NPM](https://nodei.co/npm/iobroker.freeathome.png?downloads=true)](https://nodei.co/npm/iobroker.freeathome/) -->

## freeathome adapter for ioBroker

This ioBroker adapter, connects BuschJaeger free@home system access point with ioBroker.
It creates states for **every** information from free@home and it sends **all** state changes to the system access point.

To communicate with the free@home system access point, it uses the [freeathome-api](https://www.npmjs.com/package/freeathome-api) npm package.

## Changelog

### 0.0.1
* (Lutz Lengemann) initial release

## License
MIT License

Copyright (c) 2020 Lutz Lengemann <lutz@lengemann.net>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

## Diclaimer

This ioBroker adapter is a private contribution and not related to ABB or Busch-Jaeger. 
It may not work with future updates of the free@home firmware and can also 
cause unintended behavior. Use at your own risk!

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
