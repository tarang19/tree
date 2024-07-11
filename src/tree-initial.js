const treeJson = {

  "id": "user",
  "fatherId": "father",
  "motherId": "mother",
  "data": {
    "name": "user",
    "lastname": "",
    "gender": "female",
    "dob": "1985-10-09T07:34:59.828Z",
    "dod": null
  },

  "_parents": [

    // aatya husband
    {
      "id": "aatya-husband",
      "fatherId": null,
      "motherId": null,
      "data": {
        "name": "aatya husband",
        "lastname": "",
        "gender": "male",
        "dob": "1985-10-09T07:34:59.828Z",
        "dod": null,        
      },
      "_partners": ['aatya'],
      "_parents": []
    },

    // aatya
    {
      "id": "aatya",
      "fatherId": null,
      "motherId": null,
      "data": {
        "name": "aatya",
        "lastname": "",
        "gender": "female",
        "dob": "1985-10-09T07:34:59.828Z",
        "dod": null,        
      },
      "_partners": ['aatya-husband'],
      "_parents": []
    },    

    // kaka
    {
      "id": "kaka",
      "fatherId": null,
      "motherId": null,
      "data": {
        "name": "kaka",
        "lastname": "",
        "gender": "male",
        "dob": "1985-10-09T07:34:59.828Z",
        "dod": null,        
      },
      "_partners": ['kaku'],
      "_parents": []
    },

    // kaku
    {
      "id": "kaku",
      "fatherId": null,
      "motherId": null,
      "data": {
        "name": "kaku",
        "lastname": "",
        "gender": "female",
        "dob": "1985-10-09T07:34:59.828Z",
        "dod": null,        
      },
      "_partners": ['kaka'],
      "_parents": []
    },

    // father
    {
      "id": "father",
      "fatherId": null,
      "motherId": null,
      "data": {
        "name": "father",
        "lastname": "",
        "gender": "male",
        "dob": "1985-10-09T07:34:59.828Z",
        "dod": null,        
      },
      "_partners": ["mother", 'mother2'],
      "_spouses": [
        {
          "id": "mother",
          "fatherId": null,
          "motherId": null,
          "data": {
            "name": "mother",
            "lastname": "",
            "gender": "female",
            "dob": "1985-10-09T07:34:59.828Z",
            "dod": null,        
          },
          "_partners": ['father'],
          "_parents": [
    
            // // grand father
            // {
            //   "id": "grand-father-mother-side",
            //   "fatherId": null,
            //   "motherId": null,
            //   "data": {
            //     "name": "grand father",
            //     "lastname": "",
            //     "gender": "male",
            //     "dob": "1985-10-09T07:34:59.828Z",
            //     "dod": null,        
            //   },
            //  "_partners": ['grand-motherr-mother-side'],
            //   "_parents": []
            // },
    
            // // grand mother
            // {
            //   "id": "grand-mother-mother-side",
            //   "fatherId": null,
            //   "motherId": null,
            //   "data": {
            //     "name": "grandmother",
            //     "lastname": "",
            //     "gender": "female",
            //     "dob": "1985-10-09T07:34:59.828Z",
            //     "dod": null,       
            //   },
            //   "_partners": ['grand-father-mother-side'],
            //   "_parents": []
            // },
    
          ]
        },
        {
          "id": "mother2",
          "fatherId": null,
          "motherId": null,
          "data": {
            "name": "mother 2",
            "lastname": "",
            "gender": "female",
            "dob": "1985-10-09T07:34:59.828Z",
            "dod": null,        
          },
          "_partners": ['father'],
          "_parents": [
    
            // // grand father
            // {
            //   "id": "grand-father-mother-side",
            //   "fatherId": null,
            //   "motherId": null,
            //   "data": {
            //     "name": "grand father",
            //     "lastname": "",
            //     "gender": "male",
            //     "dob": "1985-10-09T07:34:59.828Z",
            //     "dod": null,        
            //   },
            //  "_partners": ['grand-motherr-mother-side'],
            //   "_parents": []
            // },
    
            // // grand mother
            // {
            //   "id": "grand-mother-mother-side",
            //   "fatherId": null,
            //   "motherId": null,
            //   "data": {
            //     "name": "grandmother",
            //     "lastname": "",
            //     "gender": "female",
            //     "dob": "1985-10-09T07:34:59.828Z",
            //     "dod": null,       
            //   },
            //   "_partners": ['grand-father-mother-side'],
            //   "_parents": []
            // },
    
          ]
        },
      ],
      "_siblings": ["aatya", "kaka"],
      "_parents": [        

        // grand father
        // {
        //   "id": "grand-father",
        //   "fatherId": null,
        //   "motherId": null,
        //   "data": {
        //     "name": "grand father",
        //     "lastname": "",
        //     "gender": "male",
        //     "dob": "1985-10-09T07:34:59.828Z",
        //     "dod": null,        
        //   },
        //   //"_partners": ['grand-mother'],
        //   "_parents": []
        // },

        // grand mother
        // {
        //   "id": "grand-mother",
        //   "fatherId": null,
        //   "motherId": null,
        //   "data": {
        //     "name": "grandmother",
        //     "lastname": "",
        //     "gender": "female",
        //     "dob": "1985-10-09T07:34:59.828Z",
        //     "dod": null,       
        //   },
        //   "_partners": ['grand-father'],
        //   "_parents": []
        // },

      ] 
    },

    // mother
    {
      "id": "mother",
      "fatherId": null,
      "motherId": null,
      "data": {
        "name": "mother",
        "lastname": "",
        "gender": "female",
        "dob": "1985-10-09T07:34:59.828Z",
        "dod": null,        
      },
      "_partners": ['father'],
      "_siblings": ["mama"],
      "_parents": [

        // // grand father
        // {
        //   "id": "grand-father-mother-side",
        //   "fatherId": null,
        //   "motherId": null,
        //   "data": {
        //     "name": "grand father",
        //     "lastname": "",
        //     "gender": "male",
        //     "dob": "1985-10-09T07:34:59.828Z",
        //     "dod": null,        
        //   },
        //  "_partners": ['grand-motherr-mother-side'],
        //   "_parents": []
        // },

        // // grand mother
        // {
        //   "id": "grand-mother-mother-side",
        //   "fatherId": null,
        //   "motherId": null,
        //   "data": {
        //     "name": "grandmother",
        //     "lastname": "",
        //     "gender": "female",
        //     "dob": "1985-10-09T07:34:59.828Z",
        //     "dod": null,       
        //   },
        //   "_partners": ['grand-father-mother-side'],
        //   "_parents": []
        // },

      ]
    },

        // mother2
    {
          "id": "mother2",
          "fatherId": null,
          "motherId": null,
          "data": {
            "name": "mother 2",
            "lastname": "",
            "gender": "female",
            "dob": "1985-10-09T07:34:59.828Z",
            "dod": null,        
          },
          "_partners": ['father'],
          "_parents": []
        },
    

    

    // mama
    {
      "id": "mama",
      "fatherId": null,
      "motherId": null,
      "data": {
        "name": "mama",
        "lastname": "",
        "gender": "male",
        "dob": "1985-10-09T07:34:59.828Z",
        "dod": null,        
      },
      "_partners": ['mami'],
      "_parents": []
    },

    // mami
    {
      "id": "mami",
      "fatherId": null,
      "motherId": null,
      "data": {
        "name": "mami",
        "lastname": "",
        "gender": "female",
        "dob": "1985-10-09T07:34:59.828Z",
        "dod": null,        
      },
      "_partners": ['mama'],
      "_parents": []
    },

  ],

  "_children": [

    // cousin 00
    {
      "id": "cousin-0",
      "fatherId": "aatya-husband",
      "motherId": "aatya",
      "data": {
        "name": "cousin 00",
        "lastname": "",
        "gender": "female",
        "dob": "1985-10-09T07:34:59.828Z",
        "dod": null,        
      },
      "_children": [],         
    },

    // cousin 01
    {
      "id": "cousin-1",
      "fatherId": "aatya-husband",
      "motherId": "aatya",
      "data": {
        "name": "cousin 01",
        "lastname": "",
        "gender": "male",
        "dob": "1985-10-09T07:34:59.828Z",
        "dod": null,        
      },
      "_children": [],
      "_spouses": [
            // spouse
            {
              "id": "cousin-1-spouse",
              "fatherId": null,
              "motherId": null,
              "data": {
                "name": "cousin 1 spouse",
                "lastname": "",
                "gender": "female",
                "dob": "1985-10-09T07:34:59.828Z",
                "dod": null,        
              },
              "_children": [],         
            },
      ]            
    },

    // cousin 02
    {
      "id": "cousin-2",
      "fatherId": "kaka",
      "motherId": "kaku",
      "data": {
        "name": "cousin 02",
        "lastname": "",
        "gender": "male",
        "dob": "1985-10-09T07:34:59.828Z",
        "dod": null,        
      },
      "_children": [], 
      "_spouses": [
            // spouse
            {
              "id": "cousin-2-spouse",
              "fatherId": null,
              "motherId": null,
              "data": {
                "name": "cousin 2 spouse",
                "lastname": "",
                "gender": "female",
                "dob": "1985-10-09T07:34:59.828Z",
                "dod": null,        
              },
              "_children": [],         
            },
      ]         
    },

    // brother
    {
      "id": "brother",
      "fatherId": "father",
      "motherId": "mother",
      "data": {
        "name": "brother",
        "lastname": "",
        "gender": "male",
        "dob": "1985-10-09T07:34:59.828Z",
        "dod": null,        
      },
      "_children": [

        // brother son
        {
          "id": "brother son",
          "fatherId": "brother",
          "motherId": "brother-spouse-1",
          "data": {
            "name": "brother son",
            "lastname": "",
            "gender": "male",
            "dob": "1985-10-09T07:34:59.828Z",
            "dod": null,        
          },
          "_children": [],
          "_spouses": [
            // spouse
            {
              "id": "brother-son-spouse",
              "fatherId": null,
              "motherId": null,
              "data": {
                "name": "brother son spouse",
                "lastname": "",
                "gender": "female",
                "dob": "1985-10-09T07:34:59.828Z",
                "dod": null,        
              },
              "_children": [],         
            },
          ]          
        },

        // brother step daughter
        {
          "id": "brother daughter",
          "fatherId": "brother",
          "motherId": "brother-spouse-2",
          "data": {
            "name": "brother daughter",
            "lastname": "",
            "gender": "female",
            "dob": "1985-10-09T07:34:59.828Z",
            "dod": null,        
          },
          "_children": [],                  
        },

      ], 
      "_spouses": [

        // spouse
        {
          "id": "brother-spouse-1",
          "fatherId": null,
          "motherId": null,
          "data": {
            "name": "brother spouse 1",
            "lastname": "",
            "gender": "female",
            "dob": "1985-10-09T07:34:59.828Z",
            "dod": null,        
          },
          "_children": [],         
        },

        // spouse
        {
          "id": "brother-spouse-2",
          "fatherId": null,
          "motherId": null,
          "data": {
            "name": "brother spouse 2",
            "lastname": "",
            "gender": "female",
            "dob": "1985-10-09T07:34:59.828Z",
            "dod": null,        
          },
          "_children": [],         
        },

      ]          
    },

    //sister
    {
      "id": "sister",
      "fatherId": "father",
      "motherId": "mother",
      "data": {
        "name": "sister",
        "lastname": "",
        "gender": "female",
        "dob": "1985-10-09T07:34:59.828Z",
        "dod": null,        
      },
      "_children": [

        // sister son
        {
          "id": "sister-son",
          "fatherId": "sister-spouse",
          "motherId": "sister",
          "data": {
            "name": "sister son",
            "lastname": "",
            "gender": "male",
            "dob": "1985-10-09T07:34:59.828Z",
            "dod": null,        
          },
          "_children": []                  
        },

    //     // sister daughter
        {
          "id": "sister-daughter",
          "fatherId": "sister-spouse",
          "motherId": "sister",
          "data": {
            "name": "sister daughter",
            "lastname": "",
            "gender": "male",
            "dob": "1985-10-09T07:34:59.828Z",
            "dod": null,        
          },
          "_children": []                  
        },

      ],

      "_spouses": [

        // spouse
        {
          "id": "sister-spouse",
          "fatherId": null,
          "motherId": null,
          "data": {
            "name": "sister spouse",
            "lastname": "",
            "gender": "male",
            "dob": "1985-10-09T07:34:59.828Z",
            "dod": null,        
          },
          "_children": [],         
        },

      ]           
    },
    
    // user
    {
      "id": "user",
      "fatherId": "father",
      "motherId": "mother",
      "data": {
        "name": "user",
        "lastname": "",
        "gender": "female",
        "dob": "1985-10-09T07:34:59.828Z",
        "dod": null,        
      },
      "_children": [ 

        // daughter
        {
          "id": "step-son-01",
          "fatherId": "user-spouse-01",
          "motherId": "user",
          "data": {
            "name": "step son",
            "lastname": "",
            "gender": "male",
            "dob": "1985-10-09T07:34:59.828Z",
            "dod": null,        
          },
          "_children": [],                 
        },

        // daughter
        {
          "id": "step-son-01",
          "fatherId": "user-spouse-02",
          "motherId": "user",
          "data": {
            "name": "step son new",
            "lastname": "",
            "gender": "male",
            "dob": "1985-10-09T07:34:59.828Z",
            "dod": null,        
          },
          "_children": [],                 
        },

        // daughter
        {
          "id": "daughter-00",
          "fatherId": "user-spouse-03",
          "motherId": "user",
          "data": {
            "name": "daughter 00",
            "lastname": "",
            "gender": "female",
            "dob": "1985-10-09T07:34:59.828Z",
            "dod": null,        
          },
          "_children": [],                 
        }, 

        // daughter
        {
          "id": "daughter-000",
          "fatherId": "user-spouse-03",
          "motherId": "user",
          "data": {
            "name": "daughter 000",
            "lastname": "",
            "gender": "female",
            "dob": "1985-10-09T07:34:59.828Z",
            "dod": null,        
          },
          "_children": [],                 
        }, 

        // daughter
        {
          "id": "daughter",
          "fatherId": "user-spouse-03",
          "motherId": "user",
          "data": {
            "name": "daughter",
            "lastname": "",
            "gender": "female",
            "dob": "1985-10-09T07:34:59.828Z",
            "dod": null,        
          },
          "_children": [],                 
        },      

        // son
        {
          "id": "son",
          "fatherId": "user-spouse-03",
          "motherId": "user",
          "data": {
            "name": "son",
            "lastname": "",
            "gender": "male",
            "dob": "1985-10-09T07:34:59.828Z",
            "dod": null,        
          },
          "_children": [

            // grand son
            {
              "id": "grandson",
              "fatherId": "son",
              "motherId": "son-spouse",
              "data": {
                "name": "grandson",
                "lastname": "",
                "gender": "male",
                "dob": "1985-10-09T07:34:59.828Z",
                "dod": null,        
              },
              "_children": [],         
            },

          ],
          "_spouses": [
            // spouse
            {
              "id": "son-spouse",
              "fatherId": null,
              "motherId": null,
              "data": {
                "name": "son spouse",
                "lastname": "",
                "gender": "female",
                "dob": "1985-10-09T07:34:59.828Z",
                "dod": null,        
              },
              "_children": [],         
            },
          ]          
        },        

        // daughter
        {
          "id": "daughter-2",
          "fatherId": "user-spouse-03",
          "motherId": "user",
          "data": {
            "name": "daughter 2",
            "lastname": "",
            "gender": "female",
            "dob": "1985-10-09T07:34:59.828Z",
            "dod": null,        
          },
          "_children": [
            // grand daughter
            {
              "id": "granddaughter",
              "fatherId": "daughter-2-spouse",
              "motherId": "daughter-2",
              "data": {
                "name": "granddaughter",
                "lastname": "",
                "gender": "female",
                "dob": "1985-10-09T07:34:59.828Z",
                "dod": null,        
              },
              "_children": [],         
            },
          ],
          "_spouses": [
            // spouse
            {
              "id": "daughter-2-spouse",
              "fatherId": null,
              "motherId": null,
              "data": {
                "name": "daughter 2 spouse",
                "lastname": "",
                "gender": "male",
                "dob": "1985-10-09T07:34:59.828Z",
                "dod": null,        
              },
              "_children": [],         
            },
          ]                   
        },

      ],
      "_spouses": [
        
        // spouse 01
        {
          "id": "user-spouse-01",
          "fatherId": null,
          "motherId": null,
          "data": {
            "name": "spouse 1",
            "lastname": "",
            "gender": "male",
            "dob": "1985-10-09T07:34:59.828Z",
            "dod": null,        
          },
          "_children": [],         
        },

        // spouse 02
        {
          "id": "user-spouse-02",
          "fatherId": null,
          "motherId": null,
          "data": {
            "name": "spouse 2",
            "lastname": "",
            "gender": "male",
            "dob": "1985-10-09T07:34:59.828Z",
            "dod": null,        
          },
          "_children": [],         
        },

        // spouse 03
        {
          "id": "user-spouse-03",
          "fatherId": null,
          "motherId": null,
          "data": {
            "name": "spouse 3",
            "lastname": "",
            "gender": "male",
            "dob": "1985-10-09T07:34:59.828Z",
            "dod": null,        
          },
          "_children": [],         
        },

      ]         
    },

    // cousin mama
    {
      "id": "cousin-mama-1",
      "fatherId": "mama",
      "motherId": "mami",
      "data": {
        "name": "cousin mama 01",
        "lastname": "",
        "gender": "female",
        "dob": "1985-10-09T07:34:59.828Z",
        "dod": null,        
      },
      "_children": [],         
    },

  ]
};


export { treeJson };