const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

// @desc Login
// @route POST /auth
// @access Public
const login = asyncHandler(async (req,res) => {
    const { username, password} = req.body

    if(!username || !password) {
        return res.status(400).json({ message: 'All fields are required.' })
    }

    const foundUser = await User.findOne({ username }).exec()

    if (!foundUser || !foundUser.active) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const match = await bcrypt.compare(password, foundUser.password)

    if(!match) return res.status(401).json({ message: 'Unauthorized' })

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username,
                "roles": foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1m' }
    )

    const refreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
    )

    // Create secure cookie with refresh token
    res.cookie('jwt', refreshToken, {
        httpOnly: true, // accessible only by web server
        secure: true, // https
        sameSite: 'None', // cross-site cookie
        maxAge: 7 * 24 * 60 * 60 * 1000 // cookie expiry: set to match rT
    })

    // send accessToken containing username and rolesS
    res.json({ accessToken })
})

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req,res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async(err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })

            const foundUser = await User.findone({ username: decoded.username })

            if (!foundUser) return res.status(401).json({ message: 'Unauthorized'})

            const accessToken = jwt.sign(
                {
                    "UseInfo": {
                        "username": foundUser.username,
                        "roles": foundUser.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '10s' }
            )

            res.json({ accessToken })
        })
    )
}

// @desc Logout
// @route POST /auth/logout
// @access Public - To clear cookies if they exist
const logout = (req,res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204) // No Content
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    res.json({ message: 'Cookie cleared' })
}

module.exports = {
    login,
    refresh,
    logout
}