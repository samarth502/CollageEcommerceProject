const cartModel = require('../models/cart');
const productModel = require('../models/addproduct');
require('dotenv').config()
const Razorpay = require('razorpay')

exports.addToCart = async (req, res) => {
    try {
        let userEmail = req.email
        let productId = req.body.productId
    
        let checkUserEmail = await cartModel.findOne({ userEmail: userEmail })
    
        if (!checkUserEmail) {
            let obj = {
                userEmail: userEmail,
                productCollectionId: productId
            }
    
            await cartModel.create(obj)
    
            res.status(201).json({
                error: false
            })
        } else {
    
            if (checkUserEmail.productCollectionId.includes(productId)) {
                res.status(201).json({
                    msg: "This item is already added to cart"
                })
            } else {
                let obj = {
                    userEmail: userEmail,
                    productCollectionId: [...checkUserEmail.productCollectionId, productId]
                }
    
                await cartModel.findByIdAndUpdate(checkUserEmail._id, obj,{new:true})
    
                res.status(201).json({
                    error: false,
                    totalItem:count
                })
            }
    
        }
    } catch (error) {
        console.log(error)
    }
}

exports.sendReasponse = (req,res)=>{
    res.status(200).json({
        msg:true
    })
}

exports.getcartData = async(req,res)=>{
    try {
        let userfilterData = []
        let count = 0
        let userEmail = req.email
    
        let cartData = await cartModel.findOne({userEmail})
    
        if(cartData){
            let productCollectionId = cartData.productCollectionId
    
            for(let element of productCollectionId){
                let data = await productModel.findOne({_id:element})
    
                data['imgUrl']=process.env.URL + data._id + '/' + data.productImage
    
                count = count+1
                userfilterData.push(data)
            }
        
            res.status(200).json({
                data:userfilterData,
                totalCartItem:count
            })
        }else{
            res.status(200).json({
                msg:"No item"
            })
        }
    } catch (error) {
        console.log(error)
    }

   
}
exports.removeCartData = async (req, res) => {
    try {
        let userEmail = req.email
        let productId  = req.body.productid;

        let cartData = await cartModel.findOne({userEmail});

        cartData.productCollectionId.splice(cartData.productCollectionId.indexOf(productId),1)

        await cartModel.findByIdAndUpdate(cartData._id, cartData,{new:true})

        res.status(200).json({
            error: false
        })
    } catch (error) {
        console.log(error)
    }
}

const razorpay = new Razorpay({
    key_id: 'rzp_test_Bu0aBKP3sazdgX',
       key_secret: 'Hra0eWY630Kg3VHBpeYIYbES'
    })

exports.orderRequest = async (req,res)=>{
    const options = {
        amount: req.body.productPrice*100, 
        currency: 'INR',
        receipt: 'order_receipt_1',
        payment_capture: 1
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

