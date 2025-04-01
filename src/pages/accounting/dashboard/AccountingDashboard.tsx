import React, { useEffect, useState } from 'react';
import Card from './Card';
import { FaDollarSign, FaFileInvoice, FaFileInvoiceDollar, FaWallet } from 'react-icons/fa';
import TransactionAnalyticsComponent from './TransactionAnalyticsComponent';
import InvoiceAnalyticsComponent from './InvoiceAnalyticsComponent';
import RecentInvoicesGrid from './RecentInvoicesGrid';
import { useAccountingContext } from "pages/accounting/AccountingContext";

const AccountingDashboard: React.FC = () => {
  const {
    accountingDetails,
    getAccountingDetails,
    getAllCompanies,
  } = useAccountingContext();

  useEffect(() => {
    getAccountingDetails();
    getAllCompanies();
  }, []);
  const [tabName, setTabName] = useState<string>("invoices");
  const cardData = [
    { title: 'Transactions', amount: accountingDetails.transactionCount, icon: <FaFileInvoiceDollar className="text-[#2DC7FF] text-2xl"/>, className:'transaction' },
    { title: 'Invoices', amount: accountingDetails.invoiceCount, icon: <FaFileInvoice className="text-[#4DB452] text-2xl" />, className: 'Invoices' },
    { title: 'Amount Due', amount: accountingDetails.amountDue, icon: <FaDollarSign className="text-[#FBB400] text-2xl"/>, className: 'AmountDue' },
    { title: 'Wallet', amount: accountingDetails.walletbalance, icon: <FaWallet className="text-[#2472DB] text-2xl" />, className: 'Wallet' },
  ];
  return (
    <div className="App pt-2.5 dashboard">
      <div className="card-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xxl:grid-cols-4 gap-2.5 lg:gap-3.5 mb-2.5 lg:mb-3.5">
        {cardData.map((card, index) => (
          <Card
            key={index}
            title={card.title}
            amount={card.amount}
            icon={card.icon}
            className={card.className}
          />
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 xxl:grid-cols-3 gap-3 lg:gap-3 mb-3'>
        <div>
          <TransactionAnalyticsComponent/>
        </div>
        <div>
          <InvoiceAnalyticsComponent/>
        </div>
        <div>
        <RecentInvoicesGrid/>
        </div>
      </div>
    </div>
  )
}


export default AccountingDashboard;


function setShowSpinner(arg0: boolean) {
  throw new Error('Function not implemented.');
}

