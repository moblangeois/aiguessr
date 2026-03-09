# Production & Assembly: From Raw Materials to AI Hardware

Once minerals are extracted and refined, they enter a complex global supply chain of semiconductor fabrication, component manufacturing, and final assembly. This stage is dominated by a handful of companies operating at extraordinary scale, with significant environmental and human costs.

---

## TSMC Fab 18 — Tainan, Taiwan

### The World's Most Advanced Chip Factory

Taiwan Semiconductor Manufacturing Company (TSMC) fabricates the vast majority of the world's most advanced chips, including NVIDIA's AI GPUs. Fab 18, located in the Tainan Science Park, is one of TSMC's flagship facilities, producing chips at the 5nm and 3nm process nodes. Nearly every major AI chip — from the A100 to the H100 — is manufactured here.

### Water Consumption

Semiconductor fabrication is extraordinarily water-intensive. Ultra-pure water (UPW) is used at every stage of the lithography, etching, and cleaning processes. A single 300mm wafer fab can consume 30,000–50,000 tonnes of water per day. During Taiwan's severe drought of 2021, TSMC resorted to trucking in water — an estimated 100 water trucks per day — to keep production running while agricultural irrigation was cut.

### Energy Consumption

Advanced chip fabrication requires extreme precision environments: cleanrooms, EUV lithography machines, and constant temperature control. TSMC consumed approximately 22.7 TWh of electricity in 2022, representing roughly 6% of Taiwan's entire national electricity consumption. This figure has been rising sharply with the transition to smaller process nodes, which require more complex multi-patterning steps.

> **Key Statistics**
> - TSMC holds approximately 60% of the global semiconductor foundry market and over 90% of advanced nodes below 7nm (TrendForce, 2023).
> - TSMC consumed 22.7 TWh of electricity in 2022, a 14% increase year-over-year (TSMC ESG Report, 2022).
> - A single advanced fab uses approximately 30,000–50,000 tonnes of ultra-pure water per day.
> - TSMC used approximately 86.5 million tonnes of water in 2022 (TSMC ESG Report, 2022).
> - During the 2021 drought, TSMC purchased water from over 100 tanker trucks daily.
> - Manufacturing a single 2 cm² chip generates an estimated 20+ kg of CO2 equivalent (Gupta et al., 2022).

**Sources:** TSMC ESG Report (2022); TrendForce market analysis (2023); Gupta, U. et al., *"Chasing Carbon: The Elusive Environmental Footprint of Computing"*, IEEE HPCA (2022); Bloomberg, *"TSMC's Water Crisis"* (2021).

---

## NVIDIA H100 GPU — Carbon Footprint of an AI Accelerator

### The Chip That Powers the AI Boom

The NVIDIA H100 "Hopper" GPU is the workhorse of modern AI training. Built on TSMC's 4nm process with 80 billion transistors, it is among the most complex chips ever manufactured. Understanding its lifecycle carbon footprint illustrates the material intensity of AI hardware.

### Embodied Carbon

The embodied carbon of a semiconductor — the emissions from manufacturing before it is ever turned on — is substantial and often underestimated. Research by Gupta et al. (2022) at Meta/Harvard demonstrated that for AI accelerators, the embodied carbon can rival or exceed the operational carbon over the chip's useful life, particularly when powered by relatively clean grids.

The H100 uses an advanced CoWoS (Chip-on-Wafer-on-Substrate) packaging process that bonds the GPU die with HBM (High Bandwidth Memory) stacks. This multi-die approach increases manufacturing steps, yield losses, and consequently embodied emissions.

### Supply Chain Emissions

The H100's supply chain spans multiple countries: silicon wafers (Japan, Germany), rare gases like neon and argon (historically Ukraine, now diversified), advanced chemicals (Japan, South Korea), fabrication (Taiwan), packaging and testing (Taiwan, Malaysia), and final system integration (various).

> **Key Statistics**
> - The H100 contains approximately 80 billion transistors on a die area of 814 mm².
> - Estimated embodied carbon per H100 GPU: 150–300 kg CO2e (extrapolated from Gupta et al., 2022 and industry estimates).
> - A DGX H100 system (8 GPUs) has an estimated manufacturing footprint of 2–4 tonnes CO2e.
> - NVIDIA shipped an estimated 550,000+ H100-class GPUs in 2023 (analyst estimates).
> - Operational power per H100: up to 700W TDP (system level in DGX).
> - Global semiconductor manufacturing emissions: approximately 55 Mt CO2e/year (SEMI, 2022).

**Sources:** Gupta, U. et al., *"Chasing Carbon"*, IEEE HPCA (2022); NVIDIA H100 Data Sheet; SEMI Industry ESG Report (2022); analyst estimates (SemiAnalysis, 2023).

---

## Foxconn Longhua — Shenzhen, China

### The Factory City

The Foxconn Longhua campus in Shenzhen is one of the largest factory complexes in the world, at its peak housing over 300,000 workers within a self-contained compound complete with dormitories, canteens, hospitals, and shops. Foxconn (Hon Hai Precision) is the world's largest electronics contract manufacturer, assembling products for Apple, HP, Dell, and numerous server/networking brands used in AI infrastructure.

### The 2010 Suicide Crisis

In 2010, a wave of worker suicides at the Longhua campus drew worldwide attention: 14 workers attempted suicide (most by jumping from dormitory buildings) and at least 10 died. Investigations by journalists, labor researchers, and NGOs revealed conditions including:

- 10–12 hour shifts, 6–7 days per week, with forced overtime
- Punitive management practices and public humiliation
- Extreme social isolation despite dense communal living
- Base wages at or near the legal minimum (approximately 900 CNY/month in 2010, roughly $132)

Foxconn's response included installing safety nets around buildings, hiring counselors, and eventually raising wages. Critics noted the nets addressed symptoms rather than causes.

> **Key Statistics**
> - 14 suicide attempts and at least 10 deaths at Foxconn Longhua in 2010 (SACOM, 2010).
> - Foxconn employed over 1.2 million workers in China at its peak (2012).
> - Workers routinely exceeded China's legal overtime limit of 36 hours/month, often working 80–100 hours of overtime (China Labor Watch, 2012).
> - Base monthly wage in 2010: approximately 900 CNY ($132), later raised to 2,000 CNY (Foxconn, 2012).
> - Foxconn installed approximately 3 million square meters of safety netting around dormitories.

**Sources:** SACOM (Students and Scholars Against Corporate Misbehavior), *Workers as Machines* (2010); Chan, J. et al., *"Dying for an iPhone"*, Polity Press (2020); China Labor Watch reports (2012–2018); Ngai, P. et al., *"iSlave"*, Pluto Press (2015).

---

## Foxconn Zhengzhou — "iPhone City"

### Scale and Significance

The Foxconn Zhengzhou campus in Henan province is the world's largest iPhone assembly plant and one of China's largest single-site employers, with over 200,000 workers during peak production. While primarily associated with Apple products, the facility and its labor model are representative of the broader electronics manufacturing ecosystem that produces server components, networking equipment, and hardware for AI infrastructure.

### Labor Conditions

Investigations by China Labor Watch and journalist reports have documented recurring issues:

- **Dispatch labor abuse:** Up to 50% of the workforce employed through labor dispatch agencies, circumventing direct employment protections. Chinese law caps dispatch labor at 10% of the workforce.
- **Student labor:** Vocational students sent to Foxconn as "interns" performing the same repetitive assembly-line work as regular employees, sometimes mandated by schools as a graduation requirement.
- **Wage manipulation:** Complex pay structures where advertised wages include assumptions of maximum overtime and bonuses, with actual base pay near the minimum wage.
- **Health and safety:** Exposure to chemicals (n-hexane, aluminum dust) with inadequate protective equipment; cramped dormitories (6–8 workers per room).

### The 2022 COVID Crisis

In October–November 2022, a COVID-19 outbreak at the Zhengzhou plant led to a chaotic mass exodus of workers who fled the locked-down campus on foot, walking along highways to reach their home villages. Subsequently, newly recruited workers rioted over unpaid bonuses and poor conditions, with footage of clashes with security forces circulating globally.

> **Key Statistics**
> - Over 200,000 workers at peak production at Foxconn Zhengzhou (Reuters, 2022).
> - Dispatch workers made up an estimated 50% of the workforce, far exceeding China's 10% legal limit (China Labor Watch, 2019).
> - Workers reported 60–80 hours of overtime per month during peak production (China Labor Watch, 2019).
> - Foxconn Zhengzhou can produce an estimated 500,000 iPhones per day at peak capacity.
> - The 2022 COVID exodus involved tens of thousands of workers leaving on foot.
> - Foxconn received over $1.5 billion in government subsidies for the Zhengzhou operations (The Information, 2023).

**Sources:** China Labor Watch, *"iPhone 11 Illegally Produced"* (2019); Reuters and AP reporting on the 2022 COVID crisis; The Information, *"Inside Foxconn's Zhengzhou"* (2023); Chan, J. et al., *"Dying for an iPhone"*, Polity Press (2020).

---

## Conclusion

The production stage of AI hardware concentrates enormous environmental costs (water, energy, emissions) in semiconductor fabrication and imposes severe human costs through exploitative labor practices in assembly. These are not aberrations but structural features of a supply chain optimized for cost and speed. The chips that train large language models carry the embedded toll of drought-stricken communities in Taiwan and exhausted workers in Chinese factory cities.
