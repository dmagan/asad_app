import React from 'react';

const CustomLoading = () => {
  return (
    <div className="custom-loading-container">
      <div className="coin">
        <div className="front jump">
          <div className="star"></div>
          <span className="currency">$</span>
          <div className="shapes">
            <div className="shape_l"></div>
            <div className="shape_r"></div>
            <span className="top">PCS</span>
            <span className="bottom"></span>
          </div>
        </div>
        <div className="shadow"></div>
      </div>
      
      <style jsx="true">{`
        .custom-loading-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #ffffff;
          z-index: 9999;
        }
        
        .coin {
          position: relative;
          height: 150px;
          width: 150px;
        }
        
        .coin .front, .coin .back {
          position: absolute;
          height: 150px;
          width: 150px;
          background: #ffbd0b;
          border-radius: 50%;
          border-top: 7px solid #ffd84c;
          border-left: 7px solid #ffd84c;
          border-right: 7px solid #d57e08;
          border-bottom: 7px solid #d57e08;
          transform: rotate(44deg);
        }
        
        .coin .front:before, .coin .back:before {
          content: "";
          margin: 35.5px 35.5px;
          position: absolute;
          width: 70px;
          height: 70px;
          background: #f0a608;
          border-radius: 50%;
          border-bottom: 5px solid #ffd84c;
          border-right: 5px solid #ffd84c;
          border-left: 5px solid #d57e08;
          border-top: 5px solid #d57e08;
          z-index: 2;
        }
        
        .currency {
          overflow: hidden;
          position: absolute;
          color: #ffbd0b;
          font-size: 40px;
          transform: rotate(-44deg);
          line-height: 3.7;
          width: 100%;
          height: 100%;
          text-align: center;
          text-shadow: 0 3px 0 #cb7407;
          z-index: 3;
          border-radius: 50%;
          font-family: "Montserrat", sans-serif;
        }
        
        .currency:after {
          content: "";
          position: absolute;
          height: 200px;
          width: 40px;
          margin: 20px -65px;
          box-shadow: 50px -23px 0 -10px rgba(255, 255, 255, 0.22), 85px -10px 0 -16px rgba(255, 255, 255, 0.19);
          transform: rotate(-50deg);
          animation: shine 1.5s infinite ease;
        }
        
        @keyframes shine {
          0% {
            margin: 20px -65px;
          }
          50% {
            margin: 70px -85px;
          }
          100% {
            margin: 20px -65px;
          }
        }
        
        .shapes {
          transform: rotate(-44deg);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .shapes div {
          width: 20px;
          height: 4px;
          background: #d57e08;
          border-top: 2px solid #c47207;
          margin: 75px 7px;
          position: relative;
        }
        
        .shapes div:before {
          content: "";
          position: absolute;
          width: 20px;
          height: 4px;
          background: #d57e08;
          border-top: 2px solid #c47207;
          margin: -10px 0;
        }
        
        .shapes div:after {
          content: "";
          position: absolute;
          width: 20px;
          height: 4px;
          background: #d57e08;
          border-top: 2px solid #c47207;
          margin: 8px 0;
        }
        
        .shape_l {
          float: left;
        }
        
        .shape_r {
          float: right;
        }
        
        .top {
          font-size: 30px;
          color: #d67f08;
          text-align: center;
          width: 100%;
          position: absolute;
          left: 0;
          font-family: "Montserrat", sans-serif;
        }
        
        .bottom {
          font-size: 30px;
          color: #d67f08;
          text-align: center;
          width: 100%;
          position: absolute;
          left: 0;
          bottom: 0;
          font-family: "Montserrat", sans-serif;
        }
        
        .coin .shadow {
          width: 100%;
          height: 20px;
          background: rgba(0, 0, 0, 0.4);
          position: absolute;
          left: 0;
          bottom: -50px;
          border-radius: 50%;
          z-index: -1;
          margin: 185px 7px 0 7px;
          animation: swift 1.5s infinite ease;
        }
        
        .jump {
          animation: jump 1.5s infinite ease;
        }
        
        @keyframes jump {
          0% {
            top: 0;
          }
          50% {
            top: -40px;
          }
          100% {
            top: 0;
          }
        }
        
        @keyframes swift {
          0% {
            opacity: 0.8;
          }
          50% {
            opacity: 0.4;
            transform: scale(0.8);
          }
          100% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomLoading;