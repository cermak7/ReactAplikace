# Projekt: CRM Systém – Výběrové řízení

Tento repozitář obsahuje projekt pro výběrové řízení na nového partnera pro vývoj CRM softwaru. Projekt je postaven na Reactu a původně nakonfigurován pomocí Webpacku. Součástí zadání je refaktoring kódu, oprava chyb a migrace na Vite.

## 👥 Tým a rozdělení rolí

Projekt je zpracováván v pětičlenném týmu. Každý člen je hodnocen za kvalitu odevzdané práce a naplňování své role.

| Jméno | Role | Odpovědnost / Zpracovávaný úkol |
| :--- | :--- | :--- |
| **[Čermák]** | GIT Master | Koordinace práce, správa GIT repozitáře, code review, komunikace s vyučujícími a odpovědnost za finální odevzdání. |
| **[Buzek]** | Vývojář | **Úkol 1:** Předělat zobrazení kontaktů, schůzek a akcí pomocí React Routing (zrušení plovoucích vrstev/modálů). |
| **[Berger]** | Vývojář | **Úkol 2:** Oprava chyby v zasílání – zajištění správného překreslení tabulky při druhém uložení stavu (data se ukládají, ale UI nereaguje). |
| **[Matej]** | Vývojář | **Úkol 3:** Refaktoring tabulek – vytvoření znovupoužitelné komponenty Tabulka (s funkcemi dle sekce firem) a její implementace napříč kódem. |
| **[Karabáček]** | Vývojář | **Úkol 4 + Migrace:** Identifikace a smazání nepoužívaných komponent/souborů. Převedení projektu z Webpacku na Vite. |

---

## 🛠️ Detaily k zadání
* **Původní GIT Repozitář:** [https://github.com/lmasic/crmWAcv](https://github.com/lmasic/crmWAcv)
* **Přístupové údaje do běžící aplikace:** `reader` / `1234OLe`
* **Pracovní postup:** Každý vývojář pracuje ve vlastní větvi (`feature branch`). Sloučení do hlavní větve probíhá formou Pull Requestu, který schvaluje GIT Master.