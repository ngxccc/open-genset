# Industrial Hardware Wiring & Assembly Guide

> Technical reference and physical wiring cheat sheet for transitioning from Wokwi simulation (`gateway/wokwi/diagram.json`) to the DIN-Rail PLC Industrial IoT Gateway and HIL Test Bench.

---

## 1. Assembly Principle: 4-Layer Sequential Verification

Do not wire all modules simultaneously. Validate each layer electrically before moving to the next:

```text
[LAYER 1: CORE]  --->  [LAYER 2: PERIPHERALS]  --->  [LAYER 3: RS485 BUS]  --->  [LAYER 4: POWER & CASING]
Seat ESP32-S3          OLED + Buzzer + Button        Isolated RS485 Module        XL7015 Step-Down & DIN-Rail
into 44P Socket        Verify with USB-C 5V          Cross-connect TX/RX          Tune VOUT to 5.0V with DMM
```

---

## 2. Screw Terminal Interconnection Matrix (Checklist)

### Layer 1: Core Processor Socket

- [ ] Align **ESP32-S3-DevKitC-1 N16R8** with the two female header rows of the **44P Terminal Breakout Shield** and press down firmly until fully seated.

---

### Layer 2: Local HUD Peripherals (OLED, Buzzer, Button)

Fasten stranded copper wires ($0.5\,\text{mm}^2$) into the green screw terminals:

| Step | Peripheral Pin           | Breakout Terminal Destination | Suggested Wire Color | Verified |
| :--: | :----------------------- | :---------------------------- | :------------------: | :------: |
|  1   | **OLED: GND**            | Terminal **GND**              |        Black         |   [ ]    |
|  2   | **OLED: VCC**            | Terminal **3.3V** (or 5V)     |         Red          |   [ ]    |
|  3   | **OLED: SDA**            | Terminal **GPIO 8**           |        Green         |   [ ]    |
|  4   | **OLED: SCL**            | Terminal **GPIO 9**           |         Blue         |   [ ]    |
|  5   | **BUZZER: Positive (+)** | Terminal **GPIO 4**           |         Red          |   [ ]    |
|  6   | **BUZZER: Negative (-)** | Terminal **GND**              |        Black         |   [ ]    |
|  7   | **BUTTON: Contact 1**    | Terminal **GPIO 0**           |        Yellow        |   [ ]    |
|  8   | **BUTTON: Contact 2**    | Terminal **GND**              |        Black         |   [ ]    |

> **Layer 2 Verification:** Connect USB-C cable from laptop/charger to ESP32 $\to$ OLED displays telemetry layout, pressing button triggers audio tone $\to$ **PASS**.

---

### Layer 3: Galvanic Isolated RS485 Transceiver (Black PCB)

| Step | RS485 Module Pin      | Breakout Terminal Destination                                     | Suggested Wire Color | Verified |
| :--: | :-------------------- | :---------------------------------------------------------------- | :------------------: | :------: |
|  9   | **RS485: VIN (3–5V)** | Terminal **5V** (or 3.3V)                                         |         Red          |   [ ]    |
|  10  | **RS485: GND**        | Terminal **GND**                                                  |        Black         |   [ ]    |
|  11  | **RS485: TX**         | Terminal **GPIO 16 (RX2)** _(Cross rule: Module TX $\to$ MCU RX)_ |        Purple        |   [ ]    |
|  12  | **RS485: RX**         | Terminal **GPIO 17 (TX2)** _(Cross rule: Module RX $\to$ MCU TX)_ |        Orange        |   [ ]    |

**External Field Bus Lines (RS485 Output Terminal Block):**

- **A+** on RS485 Module $\to$ Field twisted pair **Line A** (SmartGen Controller / Genset Port A).
- **B-** on RS485 Module $\to$ Field twisted pair **Line B** (SmartGen Controller / Genset Port B).
- **Earth ($\perp$)** on RS485 Module $\to$ Enclosure Chassis Ground (ESD / Surge Protection).

---

### Layer 4: High-Voltage Automotive Buck Regulator (XL7015 DC-DC)

⚠️ **CRITICAL SAFETY DIRECTIVE:** Measure and tune $V_{\text{OUT}}$ to exactly $5.0\,\text{V}$ with a digital multimeter (XL830L) _before_ connecting to the ESP32 terminal!

| Step | XL7015 Module Terminal | Destination                  | Electrical Guardrails                                                        | Verified |
| :--: | :--------------------- | :--------------------------- | :--------------------------------------------------------------------------- | :------: |
|  13  | **XL7015: OUT (+)**    | Terminal **5V** on Breakout  | Regulated $5.0\,\text{V} \pm 0.1\,\text{V}$ DC bus                           |   [ ]    |
|  14  | **XL7015: OUT (-)**    | Terminal **GND** on Breakout | System Common Ground                                                         |   [ ]    |
|  15  | **XL7015: IN (+)**     | Genset Battery (+) Post      | $12\,\text{V} / 24\,\text{V}$ DC (withstands up to $80\,\text{V}$ load dump) |   [ ]    |
|  16  | **XL7015: IN (-)**     | Genset Battery (-) Post      | Return Ground                                                                |   [ ]    |

---

## 3. Hardware-in-the-Loop (HIL) Genset Simulator Jig (Bench Testing)

The secondary unit emulates the SmartGen HGM6120 controller over a physical RS485 cable for thesis defense demonstrations:

| Arduino Nano Pin      | Peripheral Component Destination          | Simulation Function                                                      |
| :-------------------- | :---------------------------------------- | :----------------------------------------------------------------------- |
| **5V & GND**          | Potentiometers VCC/GND & MAX485 VCC/GND   | Analog sensor reference voltage                                          |
| **Pin A0**            | Potentiometer 1 Wiper (SIG)               | Coolant Temperature Simulation ($0^\circ\text{C} - 120^\circ\text{C}$)   |
| **Pin A1**            | Potentiometer 2 Wiper (SIG)               | Engine Oil Pressure Simulation ($0 - 10\,\text{bar} / 1000\,\text{kPa}$) |
| **TX (Pin 1)**        | MAX485 Pin DI                             | Modbus-RTU Response Transmission                                         |
| **RX (Pin 0)**        | MAX485 Pin RO                             | Modbus-RTU Polling Command Reception                                     |
| **MAX485 Pair A / B** | Connected to **Gateway RS485 Pair A / B** | **Physical Twisted-Pair Modbus-RTU Industrial Bus**                      |

---

## 4. Mechanical Enclosure Fitting (145x90x40mm PLC Box)

1. Snap the 44P breakout board onto the bottom mounting standoffs.
2. Cut a $28 \times 15\,\text{mm}$ rectangular window in the center of the top lid for the 0.96" OLED screen.
3. Align the green screw terminal blocks with the enclosure side cutouts so wiring can be tightened externally.
4. Mount the assembled enclosure onto a standard $35\,\text{mm}$ DIN-Rail segment using the red rear spring latches.
