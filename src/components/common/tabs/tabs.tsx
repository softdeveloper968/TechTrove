// Tabs.tsx

import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

interface TabItem {
  id: number;
  name: string;
  content: React.ReactNode; // Use React.ReactNode for dynamic content
  isVisible?:boolean
}

interface TabComponentProps {
  tabs: TabItem[];
  onTabSelect: (index: number) => void;
  selectedTabIndex?:number;
}

const TabComponent: React.FC<TabComponentProps> = ({ tabs, onTabSelect,selectedTabIndex }) => {
  // const [selectedIndex, setSelectedIndex] = useState(selectedTabIndex === undefined ? 0 :selectedTabIndex);
  const location = useLocation();

  const handleTabSelect = (index: number) => {
    // setSelectedIndex(index);
    onTabSelect(index);
  };

  useEffect(() => {
    // Access the pathname from the location object
    const currentRoute = location.pathname;
    if (currentRoute.includes("court")) {
      // setSelectedIndex(1);
    } else {
      // setSelectedIndex(0);
    }
  }, []);
  return (
    <Tabs selectedIndex={selectedTabIndex} onSelect={handleTabSelect} className={'my-1.5 bg-white p-3 md:p-3.5 pb-3.5 md:pb-4 rounded shadow-lg shadow-slate-300'}>
      <div className="tab_scroll">
      <TabList className="flex relative bg-white border-b tabListView min-w-fit">
        {tabs.map((item, index) => (
          <Tab
            key={item.id}
            className={`!text-[11px] max-w-48 mb-[-1px] leading-[14px] text-center flex items-center min-h-7 font-medium py-1 px-3.5 cursor-pointer !border !border-b-0 !border-[#0000] !outline-0 !rounded-[6px_6px_0px_0px] !bg-transparent !text-[#222] ${
              index === selectedTabIndex
                ? "active-tab-class !bg-white !border-[#dee2e6] !text-[#3986ed]"
                : "!bg-transparent !text-[#222] !border-[#0000]"
            }`}
            style={item.isVisible !== undefined ? { display: item.isVisible ? 'flex' : 'none' } : {}}
          >
            {item.name}
          </Tab>
        ))}
      </TabList>
      </div>
      {tabs.map((item) => (
        <TabPanel key={item.id}>
          <div className="p-0">{item.content}</div>
        </TabPanel>
      ))}
    </Tabs>
  );
};

export default TabComponent;
