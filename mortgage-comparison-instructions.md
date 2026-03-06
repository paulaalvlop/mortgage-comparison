**Mortgage Comparison Tool**

Objective: Build a React web app that allows a user to input loan amount, interest rate, and term in years. The app should calculate monthly payment, total interest, and display an amortization table. Use functional components and simple state management. No authentication. No backend.

I want to be able to compare up to 8 mortgage offers at the same time. For each mortgage the user will provide as inputs:

- Entity (the bank)  
- Fixed or variable (for now we are only going to model fixed mortgages)  
- Interest rate for the loan  
  - In some cases the bank offers a lower interest rate at the beginning of the loan, so you should ask the user if there is a lower interest rate at the beginning and for how long to model the loan accordingly  
- Term (in years)  
- Vinculaciones (Y/N)  
  - If yes, prompt a dropdown with the following option for the user to choose from:  
    - Nomina  
    - Hogar  
    - Otro (ask for text)  
  - For each “vinculacion”, the user must input the monthly cost (this will be a number)  
- Opening fee  
- Broker fee (if applicable)  
- Early amortization fees (these can very throughout the duration of the loan, often loans can have a fee for the first X years, and then is reduced to 0, so the input should clearly define that)

Inputs that are independent of the mortgage (so they should be used across

The output of the comparison tool should be, for each mortgage:

- Monthly payment  
- Amortization table  
- Total interest paid over the course of the loan  
- Total cost of “vinculaciones” over the course of the loan  
- Total real cost of the loan (interest+vinculaciones+opening fee+broker fee)  
- Real interest rate (calculated taking into account the total real costs)