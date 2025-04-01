import React from 'react';

function Card(props: { title: string; amount: number; icon: any; className: string; }) {
   const { title, amount, icon, className } = props; // Destructure props to access individual properties
   const amountNumber = isNaN(Number(amount)) ? 0 : Number(amount);
   
   // Format amount as US dollars
   var formattedAmount =""
   if(title == 'Transactions' || title == 'Invoices')
   {
    formattedAmount = amountNumber.toString();

   }
   else
   {
       formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amountNumber);

   }


   return (
      <div className={`card p-2.5 xl:p-3.5 overflow-hidden flex rounded-md items-center bg-white shadow-[0px_0px_14px_#523F691A] w-full border-1 border-[#F1F1F1] ${className}`}>
         <div className="icon-container h-[46px] w-[46px] xl:h-[52px] xl:w-[52px] flex items-center justify-center p-1.5 rounded-[8px] mr-2.5">
            {icon}
         </div>
         <div>
            <div className="title text-[#878A99] text-xs font-medium">{title}</div>
            <div className="amount text-[#1C1C1C] text-lg xl:text-xl font-bold">{formattedAmount}</div>
         </div>
      </div>
   );
}

export default Card;
